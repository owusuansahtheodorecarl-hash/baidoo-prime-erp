<?php
// ===================================================
// BAIDOO PRIME ERP - PAYMENT & BALANCE LOGIC
// ===================================================

class OrderManager {

    /**
     * Calculates payment status based on total price and amount paid.
     */
    public function calculatePaymentStatus($totalAmount, $amountPaid) {
        $remainingBalance = $totalAmount - $amountPaid;

        if ($amountPaid <= 0) {
            $status = 'PENDING';
        } elseif ($remainingBalance > 0) {
            $status = 'PARTIAL';
        } else {
            $status = 'PAID_IN_FULL';
        }

        return [
            'total_amount'      => number_format($totalAmount, 2),
            'amount_paid'       => number_format($amountPaid, 2),
            'remaining_balance' => number_format(max(0, $remainingBalance), 2),
            'payment_status'    => $status
        ];
    }

    /**
     * Generates unique receipt / order tracking number
     */
    public function generateOrderNumber($lastId) {
        $nextId = $lastId + 1;
        return "BP-" . date("Y") . "-" . str_pad($nextId, 5, "0", STR_PAD_LEFT);
    }
}

// EXAMPLE TEST:
// Customer buys tyres worth 10,000 GHS and pays 4,000 GHS down
$manager = new OrderManager();
$result = $manager->calculatePaymentStatus(10000.00, 4000.00);

// Order ID output example: BP-2026-00001
$orderId = $manager->generateOrderNumber(0);