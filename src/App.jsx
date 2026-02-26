
import React, { useState, useEffect, useRef } from 'react';

// Centralized Role-Based Access Control Configuration
const ROLES = {
  ADMIN: 'Admin',
  WAREHOUSE_MANAGER: 'Warehouse Manager',
  INVENTORY_STAFF: 'Inventory Staff',
  PROCUREMENT_TEAM: 'Procurement Team',
  OPERATIONS_MANAGER: 'Operations Manager',
};

// --- Sample Data ---
const sampleInventoryItems = [
  {
    id: 'INV001',
    name: 'Product A - Large',
    sku: 'PA-L-001',
    category: 'Electronics',
    quantity: 120,
    unit: 'pcs',
    location: 'WH001-A1-S1',
    warehouseId: 'WH001',
    status: 'Approved',
    reorderLevel: 50,
    lastUpdated: '2023-10-26T10:30:00Z',
    supplier: 'SupplierTech Inc.',
    description: 'High-demand large electronic component. Used in server racks.',
    currentValue: 120 * 150, // quantity * unitPrice
    unitPrice: 150,
    historicalData: [
      { date: '2023-01-01', quantity: 200 },
      { date: '2023-02-01', quantity: 180 },
      { date: '2023-03-01', quantity: 190 },
      { date: '2023-04-01', quantity: 170 },
      { date: '2023-05-01', quantity: 160 },
      { date: '2023-06-01', quantity: 140 },
      { date: '2023-07-01', quantity: 130 },
      { date: '2023-08-01', quantity: 125 },
      { date: '2023-09-01', quantity: 120 },
      { date: '2023-10-01', quantity: 120 },
    ],
    workflow: [
      { stage: 'Created', by: 'John Doe', date: '2023-09-01T09:00:00Z', status: 'completed' },
      { stage: 'Approved', by: 'Jane Smith', date: '2023-09-02T11:00:00Z', status: 'completed' },
      { stage: 'In Stock', by: 'Warehouse Staff', date: '2023-09-05T14:00:00Z', status: 'completed' },
      { stage: 'Monitored', by: 'System', date: '2023-10-26T10:30:00Z', status: 'current', slaEndDate: '2024-09-05T14:00:00Z' },
    ],
    auditLog: [
      { timestamp: '2023-10-26T10:30:00Z', user: 'System', action: 'Quantity updated from 125 to 120', type: 'update' },
      { timestamp: '2023-10-25T15:00:00Z', user: 'Inventory Staff', action: 'Barcode scan confirmed quantity 125', type: 'scan' },
      { timestamp: '2023-09-05T14:00:00Z', user: 'Warehouse Staff', action: 'Item received and put away', type: 'receive' },
      { timestamp: '2023-09-02T11:00:00Z', user: 'Jane Smith', action: 'Item definition approved', type: 'approval' },
      { timestamp: '2023-09-01T09:00:00Z', user: 'John Doe', action: 'New inventory item created', type: 'create' },
    ],
    relatedRecords: [
      { type: 'Purchase Order', id: 'PO2023-005', description: 'Order for 100 units', link: { screen: 'PURCHASE_ORDER_DETAIL', params: { orderId: 'PO2023-005' } } },
      { type: 'Warehouse Location', id: 'WH001-A1-S1', description: 'Primary storage location', link: { screen: 'WAREHOUSE_DETAIL', params: { warehouseId: 'WH001' } } },
    ],
    documents: [
      { name: 'Product_A_Datasheet.pdf', url: '#', type: 'pdf' },
      { name: 'Safety_Guidelines.docx', url: '#', type: 'docx' },
    ],
  },
  {
    id: 'INV002',
    name: 'Product B - Small',
    sku: 'PB-S-002',
    category: 'Hardware',
    quantity: 30,
    unit: 'boxes',
    location: 'WH001-B2-S3',
    warehouseId: 'WH001',
    status: 'Pending',
    reorderLevel: 20,
    lastUpdated: '2023-10-26T11:00:00Z',
    supplier: 'Fasteners Ltd.',
    description: 'Small hardware components, packaged in boxes of 1000 units.',
    currentValue: 30 * 50,
    unitPrice: 50,
    workflow: [
      { stage: 'Created', by: 'Alice Green', date: '2023-10-01T10:00:00Z', status: 'completed' },
      { stage: 'Pending Approval', by: 'Bob Brown', date: '2023-10-02T09:00:00Z', status: 'current', slaEndDate: '2023-10-28T09:00:00Z' },
      { stage: 'In Stock', by: '', date: '', status: 'upcoming' },
      { stage: 'Monitored', by: '', date: '', status: 'upcoming' },
    ],
    auditLog: [
      { timestamp: '2023-10-02T09:00:00Z', user: 'System', action: 'Workflow stage changed to Pending Approval', type: 'workflow' },
      { timestamp: '2023-10-01T10:00:00Z', user: 'Alice Green', action: 'New inventory item created', type: 'create' },
    ],
    documents: [{ name: 'Product_B_Specs.pdf', url: '#', type: 'pdf' }],
  },
  {
    id: 'INV003',
    name: 'Raw Material C',
    sku: 'RMC-003',
    category: 'Raw Materials',
    quantity: 500,
    unit: 'kg',
    location: 'WH002-C3-S1',
    warehouseId: 'WH002',
    status: 'In Progress',
    reorderLevel: 100,
    lastUpdated: '2023-10-25T14:15:00Z',
    supplier: 'Materials Co.',
    description: 'Essential raw material for manufacturing process.',
    currentValue: 500 * 2.5,
    unitPrice: 2.5,
    workflow: [
      { stage: 'Created', by: 'Procurement Team', date: '2023-10-20T08:00:00Z', status: 'completed' },
      { stage: 'PO Issued', by: 'Procurement Team', date: '2023-10-20T10:00:00Z', status: 'completed' },
      { stage: 'Awaiting Delivery', by: 'Supplier', date: '2023-10-22T12:00:00Z', status: 'current', slaEndDate: '2023-10-27T12:00:00Z' },
      { stage: 'Received & Inspected', by: '', date: '', status: 'upcoming' },
      { stage: 'In Stock', by: '', date: '', status: 'upcoming' },
    ],
    auditLog: [
      { timestamp: '2023-10-22T12:00:00Z', user: 'System', action: 'PO Confirmed. Awaiting Delivery.', type: 'status' },
      { timestamp: '2023-10-20T10:00:00Z', user: 'Procurement Team', action: 'Purchase Order PO2023-010 issued.', type: 'po' },
    ],
  },
  {
    id: 'INV004',
    name: 'Packaging Box - Small',
    sku: 'PB-S-004',
    category: 'Packaging',
    quantity: 5000,
    unit: 'pcs',
    location: 'WH001-D4-S2',
    warehouseId: 'WH001',
    status: 'Approved',
    reorderLevel: 2000,
    lastUpdated: '2023-10-24T09:00:00Z',
    supplier: 'BoxCo',
    description: 'Standard small packaging boxes for shipping.',
    currentValue: 5000 * 0.5,
    unitPrice: 0.5,
    historicalData: [
      { date: '2023-01-01', quantity: 10000 },
      { date: '2023-02-01', quantity: 9500 },
      { date: '2023-03-01', quantity: 8000 },
      { date: '2023-04-01', quantity: 7000 },
      { date: '2023-05-01', quantity: 6500 },
      { date: '2023-06-01', quantity: 6000 },
      { date: '2023-07-01', quantity: 5500 },
      { date: '2023-08-01', quantity: 5200 },
      { date: '2023-09-01', quantity: 5000 },
      { date: '2023-10-01', quantity: 5000 },
    ],
    workflow: [
      { stage: 'Created', by: 'System', date: '2023-08-01T09:00:00Z', status: 'completed' },
      { stage: 'Approved', by: 'Operations Manager', date: '2023-08-02T10:00:00Z', status: 'completed' },
      { stage: 'In Stock', by: 'Warehouse Staff', date: '2023-08-05T12:00:00Z', status: 'completed' },
      { stage: 'Monitored', by: 'System', date: '2023-10-24T09:00:00Z', status: 'current', slaEndDate: '2024-08-05T12:00:00Z' },
    ],
    auditLog: [
      { timestamp: '2023-10-24T09:00:00Z', user: 'System', action: 'Inventory check passed', type: 'system' },
      { timestamp: '2023-09-10T11:00:00Z', user: 'Warehouse Staff', action: '300 units issued for shipping', type: 'issue' },
    ],
  },
  {
    id: 'INV005',
    name: 'Defective Unit - Product A',
    sku: 'PA-DEF-001',
    category: 'Returns',
    quantity: 5,
    unit: 'pcs',
    location: 'WH001-R0-DEF',
    warehouseId: 'WH001',
    status: 'Exception',
    reorderLevel: 0,
    lastUpdated: '2023-10-20T16:00:00Z',
    supplier: 'N/A',
    description: 'Units returned due to manufacturing defects. Awaiting disposition.',
    currentValue: 5 * 0, // No value for defective
    unitPrice: 0,
    workflow: [
      { stage: 'Received', by: 'Customer Service', date: '2023-10-18T10:00:00Z', status: 'completed' },
      { stage: 'Quarantined', by: 'Warehouse Staff', date: '2023-10-19T11:00:00Z', status: 'completed' },
      { stage: 'Awaiting Disposition', by: 'Quality Control', date: '2023-10-20T16:00:00Z', status: 'current', slaEndDate: '2023-10-27T16:00:00Z', slaBreached: true },
      { stage: 'Disposed/Repaired', by: '', date: '', status: 'upcoming' },
    ],
    auditLog: [
      { timestamp: '2023-10-20T16:00:00Z', user: 'Quality Control', action: 'Disposition pending (SLA breached)', type: 'workflow' },
      { timestamp: '2023-10-19T11:00:00Z', user: 'Warehouse Staff', action: 'Moved to quarantine area WH001-R0-DEF', type: 'movement' },
      { timestamp: '2023-10-18T10:00:00Z', user: 'Customer Service', action: 'Defective item logged (RMA #2023-015)', type: 'return' },
    ],
  },
];

const sampleWarehouses = [
  { id: 'WH001', name: 'Main Distribution Center', location: '123 Tech Drive, Cityville', capacity: 10000, utilized: 7500, utilization: 75, status: 'Active', manager: 'Jane Smith', totalItems: 3, lastAudit: '2023-10-20' },
  { id: 'WH002', name: 'Raw Materials Storage', location: '456 Industrial Rd, Townsville', capacity: 5000, utilized: 3000, utilization: 60, status: 'Active', manager: 'Bob Johnson', totalItems: 1, lastAudit: '2023-10-15' },
  { id: 'WH003', name: 'Return & Repair Hub', location: '789 Service Ave, Villageton', capacity: 2000, utilized: 1000, utilization: 50, status: 'Active', manager: 'Alice Green', totalItems: 0, lastAudit: '2023-10-22' },
];

const samplePurchaseOrders = [
  { id: 'PO2023-001', supplier: 'SupplierTech Inc.', date: '2023-10-01', status: 'Approved', totalAmount: 15000, items: [{ sku: 'PA-L-001', quantity: 100, unitPrice: 150 }], expectedDelivery: '2023-10-30', createdBy: 'John Doe' },
  { id: 'PO2023-002', supplier: 'Fasteners Ltd.', date: '2023-10-05', status: 'Pending', totalAmount: 2500, items: [{ sku: 'PB-S-002', quantity: 50, unitPrice: 50 }], expectedDelivery: '2023-11-10', createdBy: 'Alice Green' },
  { id: 'PO2023-003', supplier: 'BoxCo', date: '2023-09-20', status: 'In Progress', totalAmount: 5000, items: [{ sku: 'PB-S-004', quantity: 10000, unitPrice: 0.5 }], expectedDelivery: '2023-10-28', createdBy: 'Operations Manager' },
  { id: 'PO2023-004', supplier: 'Materials Co.', date: '2023-09-25', status: 'Rejected', totalAmount: 750, items: [{ sku: 'RMC-003', quantity: 300, unitPrice: 2.5 }], expectedDelivery: '2023-10-20', createdBy: 'Bob Brown' },
];

const sampleReorderAlerts = [
  { id: 'R001', itemSku: 'PA-L-001', itemName: 'Product A - Large', currentQuantity: 120, reorderLevel: 50, status: 'Approved', dateTriggered: '2023-10-26', priority: 'High', action: 'Create PO' },
  { id: 'R002', itemSku: 'PB-S-002', itemName: 'Product B - Small', currentQuantity: 30, reorderLevel: 20, status: 'Pending', dateTriggered: '2023-10-25', priority: 'Medium', action: 'Review' },
  { id: 'R003', itemSku: 'RMC-003', itemName: 'Raw Material C', currentQuantity: 500, reorderLevel: 100, status: 'In Progress', dateTriggered: '2023-10-24', priority: 'High', action: 'Expedite Delivery' },
  { id: 'R004', itemSku: 'PB-S-004', itemName: 'Packaging Box - Small', currentQuantity: 5000, reorderLevel: 2000, status: 'Approved', dateTriggered: '2023-10-23', priority: 'Low', action: 'Monitor' },
];

// --- Reusable Components ---
const Card = ({ children, title, onClick, className = '', style = {}, isInteractive = true }) => {
  const CardContent = (
    <>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </>
  );

  return isInteractive ? (
    <div className={`card ${className}`} onClick={onClick} style={style}>
      {CardContent}
    </div>
  ) : (
    <div className={`card non-interactive ${className}`} style={style}>
      {CardContent}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusClass = status?.toLowerCase()?.replace(/\s/g, '-');
  return (
    <span className={`status-badge ${statusClass}`}>
      {status}
    </span>
  );
};

const MilestoneTracker = ({ workflow, currentStage = '' }) => {
  const getStatusClass = (stageStatus, stageName) => {
    if (stageStatus === 'completed') return 'completed';
    if (stageStatus === 'current') {
      const current = workflow.find(s => s.status === 'current');
      if (current?.slaBreached) return 'breached';
      return 'current';
    }
    return ''; // upcoming or other
  };

  return (
    <div className="milestone-tracker">
      {workflow?.map((stage, index) => (
        <div key={index} className={`milestone-stage ${getStatusClass(stage?.status, stage?.stage)}`}>
          <div className="milestone-stage-icon">
            {stage?.status === 'completed' ? '✓' : stage?.status === 'current' ? '▶' : index + 1}
          </div>
          <div className="milestone-stage-content">
            <div className="label">{stage?.stage} {stage?.status === 'current' && stage?.slaBreached && <span style={{color: 'white', marginLeft: 'var(--spacing-xs)'}}>(SLA Breached)</span>}</div>
            {stage?.by && <div className="date">By {stage?.by} on {stage?.date ? new Date(stage.date).toLocaleDateString() : 'N/A'}</div>}
            {stage?.status === 'current' && stage?.slaEndDate && (
              <div className="date">Due by: {new Date(stage.slaEndDate).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const AuditFeed = ({ logs, role }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'update': return '⚙️';
      case 'create': return '➕';
      case 'delete': return '🗑️';
      case 'approval': return '✅';
      case 'workflow': return '➡️';
      case 'system': return '🤖';
      case 'scan': return '🔎';
      case 'receive': return '📦';
      case 'issue': return '🚚';
      case 'po': return '🧾';
      case 'movement': return '🔄';
      case 'return': return '↩️';
      default: return '📝';
    }
  };

  // RBAC for logs - basic example, might need more granular logic
  const filteredLogs = role === ROLES.INVENTORY_STAFF ? logs?.filter(log => log?.type !== 'system' && log?.type !== 'po') : logs;

  if (!filteredLogs || filteredLogs.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>No audit history available.</p>;
  }

  return (
    <div className="audit-feed">
      {filteredLogs?.map((log, index) => (
        <div key={index} className="audit-item">
          <span className="audit-icon">{getIcon(log?.type)}</span>
          <div className="audit-text">
            <strong>{log?.user}</strong> {log?.action}
          </div>
          <div className="audit-date">{new Date(log?.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ title, description, icon = '📊', actionButton = null }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    {actionButton && <button onClick={actionButton.onClick}>{actionButton.label}</button>}
  </div>
);

const ChartComponent = ({ type, title, data, className = '' }) => (
  <div className={`chart-container ${className}`} style={{ position: 'relative' }}>
    <p style={{ position: 'absolute', top: 'var(--spacing-md)', left: 'var(--spacing-md)', fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>{title}</p>
    <p>Placeholder for {type} Chart</p>
    {/* In a real app, this would render a charting library component like Recharts, Chart.js, or Highcharts */}
  </div>
);

// --- Screen Components ---
const Header = ({ onNavigate, currentUserRole, onRoleChange, onSearchClick }) => {
  return (
    <header className="header glass-effect">
      <div className="header-logo" onClick={() => onNavigate('DASHBOARD')}>
        InvMan
      </div>
      <nav className="header-nav">
        <button onClick={() => onNavigate('DASHBOARD')}>Dashboard</button>
        <button onClick={() => onNavigate('INVENTORY_LIST')}>Inventory</button>
        <button onClick={() => onNavigate('WAREHOUSE_LIST')}>Warehouses</button>
        <button onClick={() => onNavigate('PURCHASE_ORDER_LIST')}>Orders</button>
        <button onClick={() => onNavigate('REORDER_ALERTS')}>Alerts</button>
        {currentUserRole === ROLES.ADMIN && (
          <button onClick={() => onNavigate('SETTINGS')}>Admin</button>
        )}
      </nav>
      <div className="header-user-info">
        <button onClick={onSearchClick} style={{ backgroundColor: 'transparent', boxShadow: 'none', color: 'var(--text-secondary)' }}>🔍 Global Search</button>
        <span>{currentUserRole}</span>
        <select value={currentUserRole} onChange={(e) => onRoleChange(e.target.value)}>
          {Object.values(ROLES).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </header>
  );
};

const GlobalSearchOverlay = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      searchRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
      setSearchResults([]);
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 2) {
      const items = sampleInventoryItems.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.sku.toLowerCase().includes(value.toLowerCase()) ||
        item.id.toLowerCase().includes(value.toLowerCase())
      ).map(item => ({
        type: 'Inventory Item',
        id: item.id,
        name: item.name,
        link: { screen: 'INVENTORY_ITEM_DETAIL', params: { itemId: item.id } }
      }));
      const warehouses = sampleWarehouses.filter(wh =>
        wh.name.toLowerCase().includes(value.toLowerCase()) ||
        wh.location.toLowerCase().includes(value.toLowerCase()) ||
        wh.id.toLowerCase().includes(value.toLowerCase())
      ).map(wh => ({
        type: 'Warehouse',
        id: wh.id,
        name: wh.name,
        link: { screen: 'WAREHOUSE_DETAIL', params: { warehouseId: wh.id } }
      }));
      setSearchResults([...items, ...warehouses]);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (link) => {
    onNavigate(link.screen, link.params);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="global-search-overlay open" onClick={onClose}>
      <div className="search-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search inventory, warehouses, orders..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(result => (
              <div key={`${result.type}-${result.id}`} className="search-result-item" onClick={() => handleResultClick(result.link)}>
                <span>{result.name}</span>
                <small>({result.type} - {result.id})</small>
              </div>
            ))}
          </div>
        )}
        {searchTerm.length > 2 && searchResults.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>No results found for "{searchTerm}"</p>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ onNavigate, currentUserRole }) => {
  const totalInventoryValue = sampleInventoryItems.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const totalShortages = sampleInventoryItems.filter(item => item.quantity <= item.reorderLevel && item.status !== 'Rejected' && item.status !== 'Exception').length;
  const totalWarehouses = sampleWarehouses.length;
  const avgUtilization = (sampleWarehouses.reduce((sum, wh) => sum + wh.utilization, 0) / totalWarehouses).toFixed(1);

  const inventoryByCategory = sampleInventoryItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const stockLevelData = {
    labels: Object.keys(inventoryByCategory),
    data: Object.values(inventoryByCategory),
  };

  const warehouseUtilizationData = {
    labels: sampleWarehouses.map(wh => wh.name),
    data: sampleWarehouses.map(wh => wh.utilization),
  };

  const recentActivities = sampleInventoryItems
    .flatMap(item => item.auditLog?.map(log => ({ ...log, itemName: item.name, itemId: item.id, type: 'inventory' })) || [])
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Inventory & Warehouse Dashboard</h1>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <Card title="Total Inventory Value" onClick={() => onNavigate('INVENTORY_LIST')} className="card-kpi">
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--primary-color)' }}>${totalInventoryValue.toLocaleString()}</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>across {sampleInventoryItems.length} unique items</p>
          <div className="card-footer">
            <span style={{color: 'var(--status-approved-text)'}}>🟢 Up 3.2% in last 30 days</span>
          </div>
        </Card>
        <Card title="Stock Shortages" onClick={() => onNavigate('REORDER_ALERTS')} className="card-kpi">
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--status-rejected-border)' }}>{totalShortages}</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>items below reorder level</p>
          <div className="card-footer">
            <span style={{color: 'var(--status-rejected-border)'}}>🔴 {totalShortages > 0 ? 'Action required!' : 'All good.'}</span>
          </div>
        </Card>
        <Card title="Warehouse Utilization" onClick={() => onNavigate('WAREHOUSE_LIST')} className="card-kpi">
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--accent-color)' }}>{avgUtilization}%</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>average across {totalWarehouses} warehouses</p>
          <div className="card-footer">
            <span style={{color: 'var(--status-in-progress-text)'}}>🔵 Optimizing for efficiency</span>
          </div>
        </Card>
        <Card title="Open Purchase Orders" onClick={() => onNavigate('PURCHASE_ORDER_LIST')} className="card-kpi">
          <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--status-pending-border)' }}>
            {samplePurchaseOrders.filter(po => po.status === 'Pending' || po.status === 'In Progress').length}
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>awaiting approval or delivery</p>
          <div className="card-footer">
            <span style={{color: 'var(--status-pending-text)'}}>🟠 Check for overdue POs</span>
          </div>
        </Card>
      </div>

      <div className="grid-container" style={{ marginTop: 'var(--spacing-lg)' }}>
        <Card isInteractive={false} style={{ gridColumn: 'span 2' }}>
          <ChartComponent type="Line" title="Inventory Quantity Trend (Past 10 Months)" data={sampleInventoryItems[0]?.historicalData} className="realtime"/>
        </Card>
        <Card isInteractive={false}>
          <ChartComponent type="Donut" title="Stock Levels by Category" data={stockLevelData} className="realtime"/>
        </Card>
        <Card isInteractive={false}>
          <ChartComponent type="Bar" title="Warehouse Capacity Utilization" data={warehouseUtilizationData} className="realtime"/>
        </Card>
        <Card isInteractive={false}>
          <h3 className="card-title">Recent Activities</h3>
          <div className="audit-feed">
            {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
              <div key={index} className="audit-item" style={{cursor: 'pointer'}} onClick={() => onNavigate('INVENTORY_ITEM_DETAIL', { itemId: activity?.itemId })}>
                <span className="audit-icon">📝</span>
                <div className="audit-text">
                  <strong>{activity?.user}</strong> {activity?.action} on <em>{activity?.itemName}</em>
                </div>
                <div className="audit-date">{new Date(activity?.timestamp).toLocaleTimeString()}</div>
              </div>
            )) : <p className="text-secondary">No recent activities.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

const InventoryItemDetail = ({ itemId, onNavigate, currentUserRole }) => {
  const item = sampleInventoryItems.find(i => i.id === itemId);

  if (!item) {
    return (
      <div className="container">
        <EmptyState
          title="Inventory Item Not Found"
          description={`The item with ID "${itemId}" could not be found.`}
          icon="🔍"
          actionButton={{ label: 'Back to Inventory List', onClick: () => onNavigate('INVENTORY_LIST') }}
        />
      </div>
    );
  }

  const handleEdit = () => {
    alert(`Editing item: ${item.name}`);
    // In a real app, this would open a form or switch to an edit view
  };

  const handleCreateReorder = () => {
    alert(`Creating reorder alert for: ${item.name}`);
    // Logic to create a new reorder alert
  };

  const canEdit = currentUserRole === ROLES.WAREHOUSE_MANAGER || currentUserRole === ROLES.ADMIN;
  const canCreateReorder = currentUserRole === ROLES.PROCUREMENT_TEAM || currentUserRole === ROLES.WAREHOUSE_MANAGER || currentUserRole === ROLES.ADMIN;

  return (
    <div className="container">
      <div className="breadcrumbs">
        <a onClick={() => onNavigate('DASHBOARD')} style={{ cursor: 'pointer' }}>Dashboard</a> <span>/</span>
        <a onClick={() => onNavigate('INVENTORY_LIST')} style={{ cursor: 'pointer' }}>Inventory List</a> <span>/</span>
        <span>{item.name} ({item.id})</span>
      </div>

      <div className="detail-view-header">
        <div>
          <h1 className="detail-view-title">{item.name} <StatusBadge status={item.status} /></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>SKU: {item.sku} | Category: {item.category}</p>
        </div>
        <div className="detail-view-actions">
          {canEdit && <button onClick={handleEdit}>Edit Item</button>}
          {canCreateReorder && <button onClick={handleCreateReorder}>Create Reorder</button>}
          <button style={{ backgroundColor: 'var(--accent-color)' }}>Export PDF</button>
        </div>
      </div>

      <div className="detail-view-grid">
        <div className="detail-view-main">
          <div className="section-card">
            <h3>Summary</h3>
            <div className="summary-item">
              <span className="summary-label">Current Quantity</span>
              <span className="summary-value">{item.quantity} {item.unit}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Reorder Level</span>
              <span className="summary-value">{item.reorderLevel} {item.unit}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Location</span>
              <span className="summary-value">{item.location} (<a onClick={() => onNavigate('WAREHOUSE_DETAIL', { warehouseId: item.warehouseId })} style={{ cursor: 'pointer' }}>{item.warehouseId}</a>)</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Supplier</span>
              <span className="summary-value">{item.supplier}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Last Updated</span>
              <span className="summary-value">{new Date(item.lastUpdated).toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Description</span>
              <span className="summary-value">{item.description}</span>
            </div>
          </div>

          <div className="section-card">
            <h3>Quantity Trend</h3>
            <ChartComponent type="Line" title="Historical Stock Levels" data={item.historicalData} />
          </div>

          <div className="section-card">
            <h3>Related Records</h3>
            {item.relatedRecords?.length > 0 ? (
              item.relatedRecords.map((record, index) => (
                <div key={index} className="summary-item" style={{ cursor: 'pointer' }} onClick={() => onNavigate(record.link?.screen, record.link?.params)}>
                  <span className="summary-label">{record.type}</span>
                  <span className="summary-value">{record.id} - {record.description}</span>
                </div>
              ))
            ) : (
              <p style={{color: 'var(--text-secondary)'}}>No related records.</p>
            )}
          </div>

          <div className="section-card">
            <h3>Documents</h3>
            {item.documents?.length > 0 ? (
              item.documents.map((doc, index) => (
                <div key={index} className="summary-item" style={{ cursor: 'pointer' }} onClick={() => alert(`Previewing ${doc.name}`)}>
                  <span className="summary-label">📄 {doc.name}</span>
                  <span className="summary-value">({doc.type?.toUpperCase()})</span>
                </div>
              ))
            ) : (
              <p style={{color: 'var(--text-secondary)'}}>No documents available.</p>
            )}
          </div>
        </div>

        <div className="detail-view-sidebar">
          <div className="section-card">
            <h3>Workflow Progress</h3>
            <MilestoneTracker workflow={item.workflow} />
          </div>

          <div className="section-card">
            <h3>News & Audit Feed</h3>
            <AuditFeed logs={item.auditLog} role={currentUserRole} />
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryList = ({ onNavigate, currentUserRole }) => {
  const [items, setItems] = useState(sampleInventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'All', category: 'All' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [inlineEdit, setInlineEdit] = useState(null); // { id: 'INV001', field: 'quantity' }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const sortedItems = [...items].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const filteredAndSortedItems = sortedItems.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'All' || item.status === filters.status;
    const matchesCategory = filters.category === 'All' || item.category === filters.category;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleInlineEditChange = (id, field, value) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveInlineEdit = (id) => {
    // Here you would typically send an API call to save the updated item
    alert(`Saving changes for item ${id}`);
    setInlineEdit(null);
  };

  const handleExport = () => alert('Exporting Inventory to Excel/PDF...');
  const handleBulkAction = (action) => alert(`Performing bulk action: ${action}`);

  const uniqueCategories = ['All', ...new Set(sampleInventoryItems.map(item => item.category))];
  const uniqueStatuses = ['All', ...new Set(sampleInventoryItems.map(item => item.status))];

  const canInlineEdit = currentUserRole === ROLES.WAREHOUSE_MANAGER || currentUserRole === ROLES.ADMIN;
  const canBulkAction = currentUserRole === ROLES.WAREHOUSE_MANAGER || currentUserRole === ROLES.ADMIN;

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Inventory List</h1>

      <div className="data-grid-wrapper">
        <div className="data-grid-header">
          <input
            type="text"
            placeholder="Search by name, SKU, or location..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <div className="flex gap-sm">
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button style={{ backgroundColor: 'var(--text-secondary)' }} onClick={() => alert('Saved current filter view')}>💾 Save View</button>
          </div>
          <div className="data-grid-actions">
            {canBulkAction && <button onClick={() => handleBulkAction('Reassign')}>Reassign</button>}
            {canBulkAction && <button onClick={() => handleBulkAction('Delete')}>Delete</button>}
            <button onClick={handleExport}>Export</button>
            <button onClick={() => alert('New Item Form')}>+ New Item</button>
          </div>
        </div>

        {filteredAndSortedItems.length > 0 ? (
          <table className="data-grid-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('name')}>Name {sortConfig.key === 'name' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('sku')}>SKU {sortConfig.key === 'sku' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('quantity')}>Quantity {sortConfig.key === 'quantity' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('location')}>Location {sortConfig.key === 'location' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('status')}>Status {sortConfig.key === 'status' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map(item => (
                <tr key={item.id} onClick={() => onNavigate('INVENTORY_ITEM_DETAIL', { itemId: item.id })} style={{ cursor: 'pointer' }}>
                  <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>
                    {inlineEdit?.id === item.id && inlineEdit?.field === 'quantity' && canInlineEdit ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleInlineEditChange(item.id, 'quantity', e.target.value)}
                        onBlur={() => handleSaveInlineEdit(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span onDoubleClick={canInlineEdit ? (e) => { e.stopPropagation(); setInlineEdit({ id: item.id, field: 'quantity' }); } : undefined}>
                        {item.quantity} {item.unit}
                      </span>
                    )}
                  </td>
                  <td>{item.location}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div className="flex gap-sm quick-actions-hover" onClick={(e) => e.stopPropagation()}>
                      {canInlineEdit && (
                        <button onClick={() => { /* Open quick edit form/modal */ alert(`Quick Edit ${item.name}`); }}>✏️</button>
                      )}
                      <button onClick={() => { /* View details (already handled by row click) */ onNavigate('INVENTORY_ITEM_DETAIL', { itemId: item.id }); }}>👁️</button>
                      {(currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.WAREHOUSE_MANAGER) && (
                        <button style={{color: 'var(--status-rejected-border)'}} onClick={() => { /* Delete item */ alert(`Delete ${item.name}`); }}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No Inventory Items Found"
            description="Adjust your search or filters, or add a new item to get started."
            icon="📦"
            actionButton={{ label: 'Add New Item', onClick: () => alert('New Item Form') }}
          />
        )}
        <div className="data-grid-footer">
          <span>{filteredAndSortedItems.length} items shown</span>
          {/* Pagination would go here */}
        </div>
      </div>
    </div>
  );
};

const WarehouseDetail = ({ warehouseId, onNavigate, currentUserRole }) => {
  const warehouse = sampleWarehouses.find(wh => wh.id === warehouseId);
  const itemsInWarehouse = sampleInventoryItems.filter(item => item.warehouseId === warehouseId);

  if (!warehouse) {
    return (
      <div className="container">
        <EmptyState
          title="Warehouse Not Found"
          description={`The warehouse with ID "${warehouseId}" could not be found.`}
          icon="🏭"
          actionButton={{ label: 'Back to Warehouse List', onClick: () => onNavigate('WAREHOUSE_LIST') }}
        />
      </div>
    );
  }

  const handleEdit = () => {
    alert(`Editing warehouse: ${warehouse.name}`);
  };

  const canEdit = currentUserRole === ROLES.WAREHOUSE_MANAGER || currentUserRole === ROLES.ADMIN;

  return (
    <div className="container">
      <div className="breadcrumbs">
        <a onClick={() => onNavigate('DASHBOARD')} style={{ cursor: 'pointer' }}>Dashboard</a> <span>/</span>
        <a onClick={() => onNavigate('WAREHOUSE_LIST')} style={{ cursor: 'pointer' }}>Warehouse List</a> <span>/</span>
        <span>{warehouse.name} ({warehouse.id})</span>
      </div>

      <div className="detail-view-header">
        <div>
          <h1 className="detail-view-title">{warehouse.name} <StatusBadge status={warehouse.status} /></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>Location: {warehouse.location}</p>
        </div>
        <div className="detail-view-actions">
          {canEdit && <button onClick={handleEdit}>Edit Warehouse</button>}
          <button style={{ backgroundColor: 'var(--accent-color)' }}>Export Report</button>
        </div>
      </div>

      <div className="detail-view-grid">
        <div className="detail-view-main">
          <div className="section-card">
            <h3>Overview</h3>
            <div className="summary-item">
              <span className="summary-label">Capacity</span>
              <span className="summary-value">{warehouse.capacity.toLocaleString()} units</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Utilized</span>
              <span className="summary-value">{warehouse.utilization}% ({warehouse.utilized.toLocaleString()} units)</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Manager</span>
              <span className="summary-value">{warehouse.manager}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Last Audit</span>
              <span className="summary-value">{warehouse.lastAudit}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Unique Items</span>
              <span className="summary-value">{itemsInWarehouse.length}</span>
            </div>
          </div>

          <div className="section-card">
            <h3>Inventory Stocked Here</h3>
            {itemsInWarehouse.length > 0 ? (
              <table className="data-grid-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsInWarehouse.map(item => (
                    <tr key={item.id} onClick={() => onNavigate('INVENTORY_ITEM_DETAIL', { itemId: item.id })} style={{ cursor: 'pointer' }}>
                      <td>{item.name}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.location}</td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{color: 'var(--text-secondary)'}}>No inventory items currently assigned to this warehouse.</p>
            )}
          </div>
        </div>

        <div className="detail-view-sidebar">
          <div className="section-card">
            <h3>Utilization Chart</h3>
            <ChartComponent type="Gauge" title="Current Utilization" data={warehouse.utilization} className="realtime"/>
          </div>
          {/* Placeholder for warehouse specific audit feed or tasks */}
          <div className="section-card">
            <h3>Recent Warehouse Movements</h3>
            <p style={{color: 'var(--text-secondary)'}}>Coming soon: Real-time logs of stock movements within this warehouse.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WarehouseList = ({ onNavigate }) => {
  const [warehouses, setWarehouses] = useState(sampleWarehouses);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const sortedWarehouses = [...warehouses].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const filteredAndSortedWarehouses = sortedWarehouses.filter(wh =>
    wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Warehouse Management</h1>

      <div className="data-grid-wrapper">
        <div className="data-grid-header">
          <input
            type="text"
            placeholder="Search by name, location, or manager..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <div className="data-grid-actions">
            <button onClick={() => alert('New Warehouse Form')}>+ New Warehouse</button>
          </div>
        </div>

        {filteredAndSortedWarehouses.length > 0 ? (
          <table className="data-grid-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')}>ID {sortConfig.key === 'id' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('name')}>Name {sortConfig.key === 'name' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('location')}>Location {sortConfig.key === 'location' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('capacity')}>Capacity {sortConfig.key === 'capacity' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('utilization')}>Utilization {sortConfig.key === 'utilization' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th>Manager</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedWarehouses.map(wh => (
                <tr key={wh.id} onClick={() => onNavigate('WAREHOUSE_DETAIL', { warehouseId: wh.id })} style={{ cursor: 'pointer' }}>
                  <td>{wh.id}</td>
                  <td>{wh.name}</td>
                  <td>{wh.location}</td>
                  <td>{wh.capacity.toLocaleString()}</td>
                  <td>{wh.utilization}%</td>
                  <td>{wh.manager}</td>
                  <td>
                    <div className="flex gap-sm quick-actions-hover" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => onNavigate('WAREHOUSE_DETAIL', { warehouseId: wh.id })}>👁️</button>
                      <button onClick={() => alert(`Edit ${wh.name}`)}>✏️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No Warehouses Found"
            description="No warehouses are currently registered in the system."
            icon="🏭"
            actionButton={{ label: 'Add New Warehouse', onClick: () => alert('New Warehouse Form') }}
          />
        )}
      </div>
    </div>
  );
};

const PurchaseOrderList = ({ onNavigate, currentUserRole }) => {
  const [orders, setOrders] = useState(samplePurchaseOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'All', createdBy: 'All' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [inlineEdit, setInlineEdit] = useState(null);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (sortConfig.key === 'totalAmount') {
        return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0; // Fallback for other types
    }
    return 0;
  });

  const filteredAndSortedOrders = sortedOrders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'All' || order.status === filters.status;
    const matchesCreatedBy = filters.createdBy === 'All' || order.createdBy === filters.createdBy;
    return matchesSearch && matchesStatus && matchesCreatedBy;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleInlineEditChange = (id, field, value) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, [field]: value } : order
      )
    );
  };

  const handleSaveInlineEdit = (id) => {
    alert(`Saving changes for PO ${id}`);
    setInlineEdit(null);
  };

  const handleExport = () => alert('Exporting Purchase Orders to Excel/PDF...');
  const handleBulkAction = (action) => alert(`Performing bulk action: ${action} on selected POs`);

  const uniqueStatuses = ['All', ...new Set(samplePurchaseOrders.map(order => order.status))];
  const uniqueCreators = ['All', ...new Set(samplePurchaseOrders.map(order => order.createdBy))];

  const canEditPO = currentUserRole === ROLES.PROCUREMENT_TEAM || currentUserRole === ROLES.ADMIN;
  const canApprovePO = currentUserRole === ROLES.OPERATIONS_MANAGER || currentUserRole === ROLES.ADMIN;

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Purchase Orders</h1>

      <div className="data-grid-wrapper">
        <div className="data-grid-header">
          <input
            type="text"
            placeholder="Search by ID, supplier, or creator..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <div className="flex gap-sm">
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              {uniqueStatuses.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select name="createdBy" value={filters.createdBy} onChange={handleFilterChange}>
              {uniqueCreators.map(creator => <option key={creator} value={creator}>{creator}</option>)}
            </select>
            <button style={{ backgroundColor: 'var(--text-secondary)' }} onClick={() => alert('Saved current filter view')}>💾 Save View</button>
          </div>
          <div className="data-grid-actions">
            {canEditPO && <button onClick={() => handleBulkAction('Approve Selected')}>Approve Selected</button>}
            {canEditPO && <button onClick={() => handleBulkAction('Reject Selected')} style={{ backgroundColor: 'var(--status-rejected-border)' }}>Reject Selected</button>}
            <button onClick={handleExport}>Export</button>
            {canEditPO && <button onClick={() => alert('New PO Form')}>+ Create PO</button>}
          </div>
        </div>

        {filteredAndSortedOrders.length > 0 ? (
          <table className="data-grid-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th onClick={() => requestSort('id')}>Order ID {sortConfig.key === 'id' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('supplier')}>Supplier {sortConfig.key === 'supplier' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('date')}>Date {sortConfig.key === 'date' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('totalAmount')}>Total Amount {sortConfig.key === 'totalAmount' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('status')}>Status {sortConfig.key === 'status' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map(order => (
                <tr key={order.id} onClick={() => alert(`View details for PO ${order.id}`)} style={{ cursor: 'pointer' }}>
                  <td><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                  <td>{order.id}</td>
                  <td>{order.supplier}</td>
                  <td>{order.date}</td>
                  <td>
                    {inlineEdit?.id === order.id && inlineEdit?.field === 'totalAmount' && canEditPO ? (
                      <input
                        type="number"
                        value={order.totalAmount}
                        onChange={(e) => handleInlineEditChange(order.id, 'totalAmount', e.target.value)}
                        onBlur={() => handleSaveInlineEdit(order.id)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <span onDoubleClick={canEditPO ? (e) => { e.stopPropagation(); setInlineEdit({ id: order.id, field: 'totalAmount' }); } : undefined}>
                        ${order.totalAmount.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>
                    <div className="flex gap-sm quick-actions-hover" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => alert(`View PO ${order.id}`)}>👁️</button>
                      {canApprovePO && order.status === 'Pending' && <button onClick={() => alert(`Approve PO ${order.id}`)} style={{color: 'var(--primary-color)'}}>✅</button>}
                      {canEditPO && <button onClick={() => alert(`Edit PO ${order.id}`)}>✏️</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No Purchase Orders Found"
            description="No purchase orders match your criteria. Try creating a new one."
            icon="🧾"
            actionButton={{ label: 'Create New PO', onClick: () => alert('New PO Form') }}
          />
        )}
        <div className="data-grid-footer">
          <span>{filteredAndSortedOrders.length} orders shown</span>
        </div>
      </div>
    </div>
  );
};

const ReorderAlertsList = ({ onNavigate }) => {
  const [alerts, setAlerts] = useState(sampleReorderAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'All', priority: 'All' });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return 0;
    }
    return 0;
  });

  const filteredAndSortedAlerts = sortedAlerts.filter(alert => {
    const matchesSearch = searchTerm === '' ||
      alert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.itemSku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'All' || alert.status === filters.status;
    const matchesPriority = filters.priority === 'All' || alert.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Reorder Alerts</h1>

      <div className="data-grid-wrapper">
        <div className="data-grid-header">
          <input
            type="text"
            placeholder="Search by item name or SKU..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <div className="flex gap-sm">
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              {['All', 'Approved', 'Pending', 'In Progress', 'Rejected'].map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              {['All', 'High', 'Medium', 'Low'].map(priority => <option key={priority} value={priority}>{priority}</option>)}
            </select>
            <button style={{ backgroundColor: 'var(--text-secondary)' }} onClick={() => alert('Saved current filter view')}>💾 Save View</button>
          </div>
          <div className="data-grid-actions">
            <button onClick={() => alert('Generate Bulk POs')}>Generate Bulk POs</button>
            <button onClick={() => alert('New Alert')}>+ Create Alert</button>
          </div>
        </div>

        {filteredAndSortedAlerts.length > 0 ? (
          <table className="data-grid-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')}>Alert ID {sortConfig.key === 'id' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('itemName')}>Item Name {sortConfig.key === 'itemName' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('itemSku')}>SKU {sortConfig.key === 'itemSku' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('currentQuantity')}>Current Qty {sortConfig.key === 'currentQuantity' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('reorderLevel')}>Reorder Level {sortConfig.key === 'reorderLevel' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('priority')}>Priority {sortConfig.key === 'priority' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th onClick={() => requestSort('status')}>Status {sortConfig.key === 'status' && <span className="sort-icon">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAlerts.map(alert => (
                <tr key={alert.id} onClick={() => onNavigate('INVENTORY_ITEM_DETAIL', { itemId: sampleInventoryItems.find(i => i.sku === alert.itemSku)?.id })} style={{ cursor: 'pointer' }}>
                  <td>{alert.id}</td>
                  <td>{alert.itemName}</td>
                  <td>{alert.itemSku}</td>
                  <td>{alert.currentQuantity}</td>
                  <td>{alert.reorderLevel}</td>
                  <td>{alert.priority}</td>
                  <td><StatusBadge status={alert.status} /></td>
                  <td>
                    <div className="flex gap-sm quick-actions-hover" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => onNavigate('INVENTORY_ITEM_DETAIL', { itemId: sampleInventoryItems.find(i => i.sku === alert.itemSku)?.id })}>👁️</button>
                      <button onClick={() => alert(`Execute action: ${alert.action} for ${alert.itemName}`)}>⚡ {alert.action}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No Reorder Alerts"
            description="All stock levels are currently healthy. Good job!"
            icon="✨"
          />
        )}
      </div>
    </div>
  );
};

const Settings = ({ currentUserRole }) => {
  const [form, setForm] = useState({
    systemName: 'Inventory & Warehouse Management',
    adminEmail: 'admin@example.com',
    reorderAutomation: true,
    fileUploadSizeLimit: 10, // MB
    sessionTimeout: 30, // minutes
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved!');
    console.log('Settings saved:', form);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`Uploaded file: ${file.name}`);
      // In a real app, send to server, get URL, display filename etc.
    }
  };

  if (currentUserRole !== ROLES.ADMIN) {
    return (
      <div className="container">
        <EmptyState
          title="Access Denied"
          description="You do not have permission to view this page."
          icon="🔒"
        />
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Admin Settings</h1>

      <Card isInteractive={false}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="systemName">System Name (Mandatory Field)</label>
            <input
              type="text"
              id="systemName"
              name="systemName"
              value={form.systemName}
              onChange={handleChange}
              required
            />
             {form.systemName.length < 3 && <p className="error-message">System name must be at least 3 characters.</p>}
          </div>

          <div className="form-group">
            <label htmlFor="adminEmail">Admin Contact Email (Auto-populated)</label>
            <input
              type="email"
              id="adminEmail"
              name="adminEmail"
              value={form.adminEmail}
              onChange={handleChange}
              readOnly // Example of auto-populated
            />
          </div>

          <div className="form-group">
            <label htmlFor="reorderAutomation">Enable Reorder Automation</label>
            <input
              type="checkbox"
              id="reorderAutomation"
              name="reorderAutomation"
              checked={form.reorderAutomation}
              onChange={handleChange}
              style={{ marginLeft: 'var(--spacing-sm)' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileUploadLimit">File Upload Size Limit (MB)</label>
            <input
              type="number"
              id="fileUploadLimit"
              name="fileUploadSizeLimit"
              value={form.fileUploadSizeLimit}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
            <input
              type="number"
              id="sessionTimeout"
              name="sessionTimeout"
              value={form.sessionTimeout}
              onChange={handleChange}
              min="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="logoUpload">Upload New Logo (File Upload)</label>
            <div className="file-upload-area" onClick={() => document.getElementById('logoInput').click()}>
              Drag & Drop or Click to Upload
              <input type="file" id="logoInput" style={{ display: 'none' }} onChange={handleFileUpload} accept=".png,.jpg,.svg" />
            </div>
          </div>

          <button type="submit" style={{ marginTop: 'var(--spacing-md)' }}>Save Settings</button>
        </form>
      </Card>
    </div>
  );
};


const Footer = () => (
  <footer className="footer">
    <p>&copy; {new Date().getFullYear()} Inventory & Warehouse Management. All rights reserved.</p>
  </footer>
);

// --- Main App Component ---
function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.WAREHOUSE_MANAGER); // Default role
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNavigate = (screen, params = {}) => {
    setView({ screen, params });
    setIsSearchOpen(false); // Close search if navigating
    window.scrollTo(0, 0); // Scroll to top on navigation
  };

  const handleRoleChange = (role) => {
    setCurrentUserRole(role);
    // Optionally reset view or show a notification that permissions changed
    alert(`User role changed to ${role}. UI may adapt.`);
  };

  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <Dashboard onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'INVENTORY_LIST':
        return <InventoryList onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'INVENTORY_ITEM_DETAIL':
        return <InventoryItemDetail itemId={view.params?.itemId} onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'WAREHOUSE_LIST':
        return <WarehouseList onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'WAREHOUSE_DETAIL':
        return <WarehouseDetail warehouseId={view.params?.warehouseId} onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'PURCHASE_ORDER_LIST':
        return <PurchaseOrderList onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'REORDER_ALERTS':
        return <ReorderAlertsList onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
      case 'SETTINGS':
        return <Settings currentUserRole={currentUserRole} />;
      default:
        return <Dashboard onNavigate={handleNavigate} currentUserRole={currentUserRole} />;
    }
  };

  return (
    <>
      <Header
        onNavigate={handleNavigate}
        currentUserRole={currentUserRole}
        onRoleChange={handleRoleChange}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      <GlobalSearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />
      <main>
        {renderScreen()}
      </main>
      <Footer />
    </>
  );
}

export default App;