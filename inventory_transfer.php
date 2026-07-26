<?php
// ===================================================
// BAIDOO PRIME ERP - INVENTORY TRANSFER LOGIC
// ===================================================

class InventoryManager {

    /**
     * Validates and processes stock transfers between branches.
     */
    public function transferStock($productName, $sourceBranch, $targetBranch, $quantityRequested, $currentSourceStock) {
        
        // Prevent transferring to the same branch
        if ($sourceBranch === $targetBranch) {
            return [
                'success' => false,
                'message' => "Transfer failed: Source and Target branches cannot be identical."
            ];
        }

        // Check stock availability
        if ($quantityRequested > $currentSourceStock) {
            return [
                'success' => false,
                'message' => "Transfer failed: Insufficient stock at {$sourceBranch}. Requested: {$quantityRequested}, Available: {$currentSourceStock}."
            ];
        }

        // Deduct from source, add to target
        $newSourceStock = $currentSourceStock - $quantityRequested;

        return [
            'success'            => true,
            'product'            => $productName,
            'transferred_qty'    => $quantityRequested,
            'source_branch'      => $sourceBranch,
            'source_stock_left'  => $newSourceStock,
            'target_branch'      => $targetBranch,
            'message'            => "Successfully transferred {$quantityRequested} units of {$productName} from {$sourceBranch} to {$targetBranch}."
        ];
    }
}

// ===================================================
// TEST EXAMPLE: Transferring 10 tyres from Main Hub to Tema Branch
// ===================================================
$inventory = new InventoryManager();

// Attempting to move 10 units when 25 are available
$result = $inventory->transferStock(
    "Triangle Tyre 315/80R22.5",
    "Accra Main Warehouse",
    "Tema Branch Shop",
    10,
    25
);