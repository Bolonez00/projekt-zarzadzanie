import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, FileImage, MapPin, DollarSign, AlertTriangle, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface ParkingSpace {
  id: string;
  number: string;
  type: string;
  is_occupied: boolean;
  user_id?: string;
}

interface Payment {
  id: string;
  user_id?: string;
  space_id?: string;
  amount: number;
  date: string;
  status: string;
  description?: string;
}

interface ReportsProps {
  parkingSpaces: ParkingSpace[];
  users: User[];
  payments: Payment[];
}

const Reports: React.FC<ReportsProps> = ({ parkingSpaces, users, payments }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'occupancy' | 'payments' | 'overdue'>('occupancy');

  const tabs = [
    { id: 'occupancy', label: 'Zajętość Miejsc', icon: MapPin },
    { id: 'payments', label: 'Raport Płatności', icon: DollarSign },
    { id: 'overdue', label: 'Zaległości', icon: AlertTriangle }
  ];

  const generateCSVReport = () => {
    let csvData: string[][] = [];
    let filename = '';

    if (activeTab === 'occupancy') {
      csvData = [
        ['Miejsce', 'Typ', 'Status', 'Uzytkownik', 'Email', 'Telefon'],
        ...parkingSpaces.map(space => {
          const user = users.find(u => u.id === space.userId);
          return [
            space.number,
            space.type,
            space.isOccupied ? 'Zajete' : 'Wolne',
            user?.name || '-',
            user?.email || '-',
            user?.phone || '-'
          ];
        })
      ];
      filename = 'raport_zajetosc_miejsc';
    } else if (activeTab === 'payments') {
      csvData = [
        ['Data', 'Uzytkownik', 'Kwota', 'Status', 'Opis'],
        ...payments.map(payment => {
          const user = users.find(u => u.id === payment.userId);
          return [
            new Date(payment.date).toLocaleDateString('pl-PL'),
            user?.name || 'Nieznany',
            `${payment.amount} zl`,
            payment.status === 'paid' ? 'Oplacone' : payment.status === 'pending' ? 'Oczekuje' : 'Przeterminowane',
            payment.description || '-'
          ];
        })
      ];
      filename = 'raport_platnosci';
    } else if (activeTab === 'overdue') {
      const overduePayments = payments.filter(p => p.status === 'overdue' || p.status === 'pending');
      csvData = [
        ['Uzytkownik', 'Email', 'Telefon', 'Kwota', 'Data', 'Status', 'Opis'],
        ...overduePayments.map(payment => {
          const user = users.find(u => u.id === payment.userId);
          return [
            user?.name || 'Nieznany',
            user?.email || '-',
            user?.phone || '-',
            `${payment.amount} zl`,
            new Date(payment.date).toLocaleDateString('pl-PL'),
            payment.status === 'pending' ? 'Oczekuje' : 'Przeterminowane',
            payment.description || '-'
          ];
        })
      ];
      filename = 'raport_zaleglosci';
    }

    // Prawidłowe formatowanie CSV z separatorami i kodowaniem UTF-8
    const csvContent = csvData.map(row => 
      row.map(cell => {
        // Escapuj komasy i cudzysłowy w danych
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(';') // Użyj średnika jako separatora dla polskich ustawień
    ).join('\r\n');
    
    // Dodaj BOM dla prawidłowego kodowania UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const generatePDFReport = () => {
    // Generowanie PDF przez bezpośrednie pobieranie
    let tableContent = '';
    let title = '';

    if (activeTab === 'occupancy') {
      title = 'Raport Zajetosci Miejsc';
      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Miejsce</th>
              <th>Typ</th>
              <th>Status</th>
              <th>Uzytkownik</th>
              <th>Email</th>
              <th>Telefon</th>
            </tr>
          </thead>
          <tbody>
            ${parkingSpaces.map(space => {
              const user = users.find(u => u.id === space.userId);
              return `
                <tr>
                  <td>${space.number}</td>
                  <td>${space.type}</td>
                  <td>${space.isOccupied ? 'Zajete' : 'Wolne'}</td>
                  <td>${user?.name || '-'}</td>
                  <td>${user?.email || '-'}</td>
                  <td>${user?.phone || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'payments') {
      title = 'Raport Platnosci';
      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Uzytkownik</th>
              <th>Kwota</th>
              <th>Status</th>
              <th>Opis</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(payment => {
              const user = users.find(u => u.id === payment.userId);
              return `
                <tr>
                  <td>${new Date(payment.date).toLocaleDateString('pl-PL')}</td>
                  <td>${user?.name || 'Nieznany'}</td>
                  <td>${payment.amount} zl</td>
                  <td>${payment.status === 'paid' ? 'Oplacone' : payment.status === 'pending' ? 'Oczekuje' : 'Przeterminowane'}</td>
                  <td>${payment.description || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    } else if (activeTab === 'overdue') {
      title = 'Raport Zaleglosci';
      const overduePayments = payments.filter(p => p.status === 'overdue' || p.status === 'pending');
      tableContent = `
        <table>
          <thead>
            <tr>
              <th>Uzytkownik</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Kwota</th>
              <th>Data</th>
              <th>Status</th>
              <th>Opis</th>
            </tr>
          </thead>
          <tbody>
            ${overduePayments.map(payment => {
              const user = users.find(u => u.id === payment.userId);
              return `
                <tr>
                  <td>${user?.name || 'Nieznany'}</td>
                  <td>${user?.email || '-'}</td>
                  <td>${user?.phone || '-'}</td>
                  <td>${payment.amount} zl</td>
                  <td>${new Date(payment.date).toLocaleDateString('pl-PL')}</td>
                  <td>${payment.status === 'pending' ? 'Oczekuje' : 'Przeterminowane'}</td>
                  <td>${payment.description || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }

    const htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="date">Wygenerowano: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}</div>
          </div>
          ${tableContent}
        </body>
      </html>
    `;
    
    // Utwórz blob z HTML i pobierz jako plik
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const occupiedSpaces = parkingSpaces.filter(space => space.isOccupied).length;
  const freeSpaces = parkingSpaces.length - occupiedSpaces;
  const totalRevenue = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
  const overduePayments = payments.filter(p => p.status === 'overdue' || p.status === 'pending');
  const overdueAmount = overduePayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'occupancy':
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Zajętość miejsc parkingowych</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Miejsce
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefon
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parkingSpaces.map((space) => {
                    const user = users.find(u => u.id === space.userId);
                    return (
                      <tr key={space.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {space.number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {space.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            space.isOccupied 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {space.isOccupied ? 'Zajęte' : 'Wolne'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user?.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user?.phone || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Historia płatności</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kwota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opis
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => {
                    const user = users.find(u => u.id === payment.userId);
                    return (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user?.name || 'Nieznany użytkownik'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {payment.amount} zł
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status === 'paid' ? 'Opłacone' : payment.status === 'pending' ? 'Oczekuje' : 'Przeterminowane'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payment.description || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'overdue':
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="text-red-800 font-medium">
                  Łączna kwota zaległości: {overdueAmount.toFixed(2)} zł
                </h4>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Użytkownicy z zaległościami</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Użytkownik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kwota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opis
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {overduePayments.map((payment) => {
                      const user = users.find(u => u.id === payment.userId);
                      return (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user?.name || 'Nieznany użytkownik'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user?.email || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user?.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {payment.amount} zł
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.date).toLocaleDateString('pl-PL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'pending' ? 'Oczekuje' : 'Przeterminowane'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {payment.description || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-blue-600" />
          Raporty
        </h2>
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Pobierz raport
        </button>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Łączna liczba miejsc</h3>
          <p className="text-3xl font-bold text-blue-600">{parkingSpaces.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Miejsca zajęte</h3>
          <p className="text-3xl font-bold text-red-600">{occupiedSpaces}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Miejsca wolne</h3>
          <p className="text-3xl font-bold text-green-600">{freeSpaces}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Przychody</h3>
          <p className="text-3xl font-bold text-purple-600">{totalRevenue.toFixed(2)} zł</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Zaległości</h3>
          <p className="text-3xl font-bold text-red-600">{overdueAmount.toFixed(2)} zł</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Modal eksportu */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Wybierz format eksportu</h3>
            <div className="space-y-3">
              <button
                onClick={generateCSVReport}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                <FileSpreadsheet className="mr-2 h-5 w-5" />
                Eksportuj jako CSV
              </button>
              <button
                onClick={generatePDFReport}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                <FileImage className="mr-2 h-5 w-5" />
                Eksportuj jako PDF
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-3 rounded-lg transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;