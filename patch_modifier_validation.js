const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/order.controller.ts', 'utf8');

const oldModifierBlock = `    const selectedModifiers = [];
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        const modName = typeof mod === 'string' ? mod : mod.name;
        let dbModPrice = 0;
        let found = false;
        for (const group of menuItem.modifierGroups) {
          const dbOpt = group.options.find((o: any) => o.name === modName);
          if (dbOpt) {
            dbModPrice = dbOpt.price;
            found = true;
            break;
          }
        }
        if (found) {
          unitPrice += dbModPrice;
          selectedModifiers.push({ name: modName, price: dbModPrice });
        }
      }
    }`;

const newModifierBlock = `    const selectedModifiers = [];
    const groupedSelections = new Map<string, number>();

    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        const modName = typeof mod === 'string' ? mod : mod.name;
        let found = false;
        
        for (const group of menuItem.modifierGroups) {
          const dbOpt = group.options.find((o: any) => o.name === modName);
          if (dbOpt) {
            if (!dbOpt.active) {
              return errorResponse(res, \`Modifier option \${modName} is not active\`, 400);
            }
            unitPrice += dbOpt.price;
            selectedModifiers.push({ name: modName, price: dbOpt.price });
            groupedSelections.set(group.name, (groupedSelections.get(group.name) || 0) + 1);
            found = true;
            break;
          }
        }
        
        if (!found) {
          return errorResponse(res, \`Invalid modifier selected: \${modName} for menu item \${menuItem.name}\`, 400);
        }
      }
    }

    // Validate modifier groups constraints
    if (menuItem.modifierGroups && menuItem.modifierGroups.length > 0) {
      for (const group of menuItem.modifierGroups) {
        const selectionCount = groupedSelections.get(group.name) || 0;
        if (group.isRequired && selectionCount === 0) {
          return errorResponse(res, \`Modifier group \${group.name} is required for \${menuItem.name}\`, 400);
        }
        if (selectionCount < group.minSelections) {
          return errorResponse(res, \`Minimum \${group.minSelections} selections required for \${group.name}\`, 400);
        }
        if (selectionCount > group.maxSelections) {
          return errorResponse(res, \`Maximum \${group.maxSelections} selections allowed for \${group.name}\`, 400);
        }
      }
    }`;

content = content.replace(oldModifierBlock, newModifierBlock);
fs.writeFileSync('server/src/controllers/order.controller.ts', content);
