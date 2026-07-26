<?php
// ===================================================
// BAIDOO PRIME ERP - ROLE-BASED ACCESS CONTROL (RBAC)
// ===================================================

class RoleManager {

    // Define permissions for each role
    private static $permissions = [
        'SUPER_ADMIN' => [
            'create_user', 'view_reports', 'edit_prices', 'process_orders', 'receive_payments', 'transfer_stock'
        ],
        'GENERAL_MANAGER' => [
            'view_reports', 'edit_prices', 'process_orders', 'receive_payments', 'transfer_stock'
        ],
        'BRANCH_MANAGER' => [
            'view_reports', 'process_orders', 'receive_payments', 'transfer_stock'
        ],
        'SALES_OFFICER' => [
            'process_orders', 'view_inventory'
        ],
        'CASHIER' => [
            'receive_payments', 'print_receipts'
        ],
        'WAREHOUSE_OFFICER' => [
            'transfer_stock', 'update_stock_quantity'
        ],
        'ACCOUNTANT' => [
            'view_reports', 'audit_payments'
        ]
    ];

    /**
     * Checks if a user role has permission to perform an action.
     */
    public static function can($role, $action) {
        if (!isset(self::$permissions[$role])) {
            return false;
        }
        return in_array($action, self::$permissions[$role]);
    }
}

// ===================================================
// EXAMPLE TESTING (Simulating Staff Logins)
// ===================================================

$salesOfficer = 'SALES_OFFICER';
$cashier = 'CASHIER';
$manager = 'GENERAL_MANAGER';

// Can a Sales Officer edit tyre prices?
$canSalesEditPrice = RoleManager::can($salesOfficer, 'edit_prices') ? 'ALLOWED' : 'DENIED';

// Can a Cashier receive payments?
$canCashierCollect = RoleManager::can($cashier, 'receive_payments') ? 'ALLOWED' : 'DENIED';

// Can a General Manager edit prices?
$canManagerEditPrice = RoleManager::can($manager, 'edit_prices') ? 'ALLOWED' : 'DENIED';

/*
  OUTPUT PREVIEW:
  - Sales Officer Edit Price: DENIED
  - Cashier Collect Payment: ALLOWED
  - Manager Edit Price: ALLOWED
*/