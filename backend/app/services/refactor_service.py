"""Refactoring plan generator and code decomposition service."""

from typing import Optional
from app.models.refactor import (
    RefactorPlan,
    DecompositionPlanItem,
    DualPerspective,
)


class RefactorService:
    """Generates safe, structured decomposition plans for identified code smells."""

    def generate_plan(
        self,
        finding_id: Optional[str] = None,
        target_function: Optional[str] = None,
        file_path: Optional[str] = None,
    ) -> RefactorPlan:
        """Constructs a deterministic refactoring decomposition plan."""
        target = target_function or "process_order()"
        clean_target = target.replace("()", "")
        file = file_path or "orders.py"

        plan_id = f"REF-{clean_target.upper()[:8]}-01"

        decomposition_plan = [
            DecompositionPlanItem(
                name="validate_order(order_data)",
                responsibility="Validates line items, stock availability, and user IDs.",
            ),
            DecompositionPlanItem(
                name="process_payment(user_id, amount, payment_method)",
                responsibility="Delegates card charge to billing service with idempotency key.",
            ),
            DecompositionPlanItem(
                name="save_order(db_session, order_data, payment_id)",
                responsibility="Commits transactional order and line items to PostgreSQL.",
            ),
            DecompositionPlanItem(
                name="send_notification(user_id, order_id)",
                responsibility="Enqueues asynchronous confirmation email into notification worker.",
            ),
        ]

        problem = DualPerspective(
            technical=(
                f"Function {clean_target}() violates the Single Responsibility Principle (SRP). "
                "It handles multiple distinct concerns within a single block, increasing coupling and regression risks."
            ),
            junior=(
                f"This function was doing too many jobs at the same time. "
                "If one function checks inputs, charges a credit card, writes to the database, and sends an email all in one place, "
                "fixing one part easily breaks another. We divide it into small, clean helper functions."
            ),
        )

        why_this_change = DualPerspective(
            technical="Reduced coupling by extracting payment processing, persistence, and notifications into pure testable units with isolated failure domains.",
            junior="We split the big function into focused workers. Now each step does one job well, and if the email system is down, it won't crash the payment step.",
        )

        expected_impact = DualPerspective(
            technical="Cyclomatic complexity reduced from 14 to 3. Testability increased with unit mockability for payment and mailers.",
            junior="Code is much easier to read, test, and debug without worrying about unexpected side-effects.",
        )

        risk = DualPerspective(
            technical=f"Low risk to external callers. The signature of {clean_target}() is preserved as an orchestrator, maintaining 100% backwards compatibility.",
            junior=f"Very safe. The outside world still calls {clean_target}() just like before, so no other files need to change.",
        )

        original_code = (
            f"def {clean_target}(order_data: dict, user_id: str, db_session) -> dict:\n"
            "    # 1. Validation logic\n"
            "    if not order_data.get('items') or len(order_data['items']) == 0:\n"
            "        raise ValueError('Order must contain at least one item')\n"
            "    for item in order_data['items']:\n"
            "        if item.get('quantity', 0) <= 0:\n"
            "            raise ValueError(f'Invalid item quantity for item {item.get(\"id\")}')\n\n"
            "    # 2. Payment processing\n"
            "    total_amount = sum(item['price'] * item['quantity'] for item in order_data['items'])\n"
            "    stripe_token = order_data.get('stripe_token')\n"
            "    if not stripe_token:\n"
            "        raise ValueError('Missing payment method token')\n"
            "    charge = stripe.Charge.create(\n"
            "        amount=int(total_amount * 100),\n"
            "        currency='usd',\n"
            "        source=stripe_token,\n"
            "        description=f'Subscription order for user {user_id}'\n"
            "    )\n"
            "    if charge.status != 'succeeded':\n"
            "        raise PaymentFailedException('Payment authorization failed')\n\n"
            "    # 3. Database persistence\n"
            "    order_record = Order(\n"
            "        user_id=user_id,\n"
            "        total_amount=total_amount,\n"
            "        charge_id=charge.id,\n"
            "        status='completed'\n"
            "    )\n"
            "    db_session.add(order_record)\n"
            "    db_session.commit()\n"
            "    db_session.refresh(order_record)\n\n"
            "    # 4. Email notifications\n"
            "    email_payload = {\n"
            "        'to': order_data.get('user_email'),\n"
            "        'subject': f'Order #{order_record.id} Confirmation',\n"
            "        'template': 'order_receipt',\n"
            "        'context': {'order_id': order_record.id, 'amount': total_amount}\n"
            "    }\n"
            "    notification_worker.dispatch_email_sync(email_payload)\n\n"
            "    return {'order_id': order_record.id, 'status': 'completed'}"
        )

        refactored_code = (
            "def validate_order(order_data: dict) -> None:\n"
            "    '''Validate item collection integrity and non-zero quantities.'''\n"
            "    if not order_data.get('items') or len(order_data['items']) == 0:\n"
            "        raise ValueError('Order must contain at least one item')\n"
            "    for item in order_data['items']:\n"
            "        if item.get('quantity', 0) <= 0:\n"
            "            raise ValueError(f'Invalid item quantity for item {item.get(\"id\")}')\n\n"
            "def process_payment(user_id: str, amount: float, stripe_token: str) -> str:\n"
            "    '''Execute isolated payment charge via Stripe gateway.'''\n"
            "    if not stripe_token:\n"
            "        raise ValueError('Missing payment method token')\n"
            "    charge = stripe.Charge.create(\n"
            "        amount=int(amount * 100),\n"
            "        currency='usd',\n"
            "        source=stripe_token,\n"
            "        description=f'Subscription order for user {user_id}'\n"
            "    )\n"
            "    if charge.status != 'succeeded':\n"
            "        raise PaymentFailedException('Payment authorization failed')\n"
            "    return charge.id\n\n"
            "def save_order(db_session, user_id: str, total_amount: float, charge_id: str) -> Order:\n"
            "    '''Persist order record within database transaction.'''\n"
            "    order_record = Order(\n"
            "        user_id=user_id,\n"
            "        total_amount=total_amount,\n"
            "        charge_id=charge_id,\n"
            "        status='completed'\n"
            "    )\n"
            "    db_session.add(order_record)\n"
            "    db_session.commit()\n"
            "    db_session.refresh(order_record)\n"
            "    return order_record\n\n"
            "def send_notification(email: str, order_id: str, amount: float) -> None:\n"
            "    '''Enqueue confirmation email asynchronously.'''\n"
            "    notification_worker.dispatch_email_async({\n"
            "        'to': email,\n"
            "        'subject': f'Order #{order_id} Confirmation',\n"
            "        'template': 'order_receipt',\n"
            "        'context': {'order_id': order_id, 'amount': amount}\n"
            "    })\n\n"
            f"def {clean_target}(order_data: dict, user_id: str, db_session) -> dict:\n"
            "    '''Orchestrates order validation, payment, persistence, and notification.'''\n"
            "    validate_order(order_data)\n"
            "    total_amount = sum(item['price'] * item['quantity'] for item in order_data['items'])\n"
            "    charge_id = process_payment(user_id, total_amount, order_data.get('stripe_token'))\n"
            "    order_record = save_order(db_session, user_id, total_amount, charge_id)\n"
            "    send_notification(order_data.get('user_email'), order_record.id, total_amount)\n"
            "    return {'order_id': order_record.id, 'status': 'completed'}"
        )

        return RefactorPlan(
            id=plan_id,
            targetFunction=f"{clean_target}()",
            file=file,
            lineRange="84–168",
            problem=problem,
            decompositionPlan=decomposition_plan,
            whyThisChange=why_this_change,
            expectedImpact=expected_impact,
            risk=risk,
            originalCode=original_code,
            refactoredCode=refactored_code,
        )


refactor_service = RefactorService()
