import { formatTry } from '@/utils/currency'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatWhen(value) {
  if (!value) return ''

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function printCheck({ businessName, check }) {
  if (!check?.items?.length) {
    throw new Error('Yazdırılacak kalem yok.')
  }

  const tableLabel = check.table
    ? `${check.table.name} (No ${check.table.tableNumber})`
    : 'Masa'
  const rows = check.items
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.name)}</td>
        <td class="num">${escapeHtml(item.quantity)}</td>
        <td class="num">${escapeHtml(formatTry(item.unitPrice))}</td>
        <td class="num">${escapeHtml(formatTry(item.lineTotal))}</td>
      </tr>`,
    )
    .join('')

  const popup = window.open('', '_blank', 'noopener,noreferrer,width=420,height=720')

  if (!popup) {
    throw new Error('Yazdırma penceresi açılamadı. Pop-up engelini kaldırın.')
  }

  popup.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Adisyon — ${escapeHtml(tableLabel)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #111;
      background: #fff;
    }
    main { width: 80mm; max-width: 100%; margin: 0 auto; padding: 16px 12px 24px; }
    h1 { margin: 0; font-size: 16px; text-align: center; font-weight: 700; }
    .meta { margin: 10px 0 14px; font-size: 12px; line-height: 1.45; text-align: center; }
    .meta p { margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 6px 2px; vertical-align: top; }
    th { border-bottom: 1px dashed #333; text-align: left; font-weight: 700; }
    td.num, th.num { text-align: right; white-space: nowrap; }
    .total {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 2px solid #111;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
    }
    .foot { margin-top: 16px; text-align: center; font-size: 11px; }
    @media print {
      @page { margin: 6mm; size: auto; }
      main { width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(businessName || 'Adisyon')}</h1>
    <div class="meta">
      <p><strong>${escapeHtml(tableLabel)}</strong></p>
      <p>${escapeHtml(formatWhen(check.openedAt))}</p>
      <p>No: ${escapeHtml(check.id)}</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>Ürün</th>
          <th class="num">Adet</th>
          <th class="num">Fiyat</th>
          <th class="num">Tutar</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total">
      <span>Toplam</span>
      <span>${escapeHtml(formatTry(check.total))}</span>
    </div>
    <p class="foot">Afiyet olsun</p>
  </main>
  <${'script'}>window.onload = () => { window.print(); };</${'script'}>
</body>
</html>`)
  popup.document.close()
}
