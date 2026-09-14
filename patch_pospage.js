const fs = require('fs');
let content = fs.readFileSync('client/src/pages/pos/POSPage.tsx', 'utf8');

// Imports
content = content.replace(
  "import { useAuthStore } from '../../store/authStore';",
  "import { useAuthStore } from '../../store/authStore';\nimport { db } from '../../utils/db';\nimport { useOfflineSync } from '../../hooks/useOfflineSync';"
);

// Add hook
content = content.replace(
  "const [activeCategory, setActiveCategory] = useState<string>('all');",
  "const { isOnline } = useOfflineSync();\n  const [activeCategory, setActiveCategory] = useState<string>('all');"
);

// Update fetchData
const oldFetch = `  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, menuRes, customersRes, tableRes] = await Promise.all([
        categoryApi.getCategories(),
        menuApi.getMenuItems(),
        customerApi.getCustomers(),
        isTablesEnabled ? getTables() : Promise.resolve({ data: { data: [] } })
      ]);
      setCategories(catRes.data.data);
      setMenuItems(menuRes.data.data);
      setCustomers(customersRes.data.data);
      if (isTablesEnabled) setTables(tableRes.data.data);
    } catch (err: any) {
      toast.error('Failed to load POS data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };`;

const newFetch = `  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, menuRes, customersRes, tableRes] = await Promise.all([
        categoryApi.getCategories(),
        menuApi.getMenuItems(),
        customerApi.getCustomers(),
        isTablesEnabled ? getTables() : Promise.resolve({ data: { data: [] } })
      ]);
      
      const cats = catRes.data.data;
      const menus = menuRes.data.data;
      
      setCategories(cats);
      setMenuItems(menus);
      setCustomers(customersRes.data.data);
      if (isTablesEnabled) setTables(tableRes.data.data);
      
      // Cache to IndexedDB for offline
      try {
        await db.categories.bulkPut(cats);
        await db.menuItems.bulkPut(menus);
      } catch (idbErr) {
        console.error('Failed to cache to IndexedDB', idbErr);
      }
    } catch (err: any) {
      // If network fails, try to load from IndexedDB
      if (!navigator.onLine || err.message === 'Network Error') {
         try {
           const offlineCats = await db.categories.toArray();
           const offlineMenus = await db.menuItems.toArray();
           if (offlineCats.length > 0 && offlineMenus.length > 0) {
             setCategories(offlineCats);
             setMenuItems(offlineMenus);
             toast.success('Loaded from offline cache');
           } else {
             toast.error('No offline data available');
           }
         } catch (idbErr) {
           toast.error('Failed to load POS data (offline)');
         }
      } else {
        toast.error('Failed to load POS data');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };`;
content = content.replace(oldFetch, newFetch);

// Update submit order
content = content.replace(
  "const res = await orderApi.createOrder(payload);",
  "let res;\n      try {\n        res = await orderApi.createOrder(payload);\n      } catch (err: any) {\n        if (!navigator.onLine || err.message === 'Network Error') {\n          // Save to offline queue\n          await db.offlineOrders.add({\n            payload,\n            status: 'queued',\n            createdAt: Date.now()\n          });\n          toast.success('Order queued offline');\n          setCart([]);\n          setSelectedCustomer(null);\n          setSelectedTable('');\n          setCheckoutModal(false);\n          return;\n        }\n        throw err;\n      }"
);

fs.writeFileSync('client/src/pages/pos/POSPage.tsx', content);
