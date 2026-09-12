function reverseMath() {
  const currentStock = 12;
  const currentAvgCost = 5.833333333333333; // 70 / 12
  const purchaseQty = 2;
  const purchaseUnitCost = 10;
  
  const newStock = currentStock - purchaseQty;
  let unitCost;
  if (newStock > 0) {
    unitCost = (currentStock * currentAvgCost - purchaseQty * purchaseUnitCost) / newStock;
  } else {
    unitCost = 0;
  }
  console.log("Reversed unitCost:", unitCost);
}

reverseMath();
