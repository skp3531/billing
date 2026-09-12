import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { printerApi, PrinterSetting } from '../../api/printer.api';
import { useAuthStore } from '../../store/authStore';

const PrinterSettingsTab = () => {
  const { currentOutlet } = useAuthStore();
  const [settings, setSettings] = useState<PrinterSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!currentOutlet) return;
      try {
        const data = await printerApi.getSettings(currentOutlet._id);
        setSettings(data);
      } catch (err) {
        toast.error('Failed to fetch printer settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentOutlet]);

  const handleUpdate = async (id: string, field: keyof PrinterSetting, value: any) => {
    const newSettings = [...settings];
    const index = newSettings.findIndex(s => s._id === id);
    if (index === -1) return;
    newSettings[index] = { ...newSettings[index], [field]: value };
    setSettings(newSettings);
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    const setting = settings.find(s => s._id === id);
    if (!setting) return;
    try {
      await printerApi.updateSetting(id, setting);
      toast.success(`${setting.type} settings saved successfully`);
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-gray-600 mb-6">Configure thermal printer settings for your outlets. Note that browser-based printing will open the standard print dialog.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {settings.map(setting => (
          <div key={setting._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">{setting.type === 'RECEIPT' ? 'Customer Receipt' : 'Kitchen KOT'} Printer</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
              <select 
                value={setting.paperSize} 
                onChange={e => handleUpdate(setting._id, 'paperSize', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
            </div>

            {setting.type === 'RECEIPT' && (
              <>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={setting.showLogo} 
                    onChange={e => handleUpdate(setting._id, 'showLogo', e.target.checked)}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500" 
                  />
                  <label className="text-sm font-medium text-gray-700">Show Restaurant Logo</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
                  <textarea 
                    value={setting.headerText || ''} 
                    onChange={e => handleUpdate(setting._id, 'headerText', e.target.value)}
                    placeholder="E.g. Welcome to Shake Sphere!"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                  <textarea 
                    value={setting.footerText || ''} 
                    onChange={e => handleUpdate(setting._id, 'footerText', e.target.value)}
                    placeholder="E.g. Thank you for visiting!"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 h-20"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Copies</label>
              <input 
                type="number" 
                min="1" 
                max="5"
                value={setting.printCopies} 
                onChange={e => handleUpdate(setting._id, 'printCopies', parseInt(e.target.value) || 1)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button 
              onClick={() => handleSave(setting._id)}
              disabled={saving}
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Save {setting.type} Settings
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrinterSettingsTab;
