const GITHUB_TOKEN = "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"; // Ganti dengan token kamu (JANGAN publikasikan)
const REPO = "ajiidrus/logbook-data";  // Ganti: contoh "ajiidrus/logbook-data"
const BRANCH = "main";

function getFilePath() {
  const month = document.getElementById("month").value;
  return `logbook/${month}.json`;
}

async function loadData() {
  const filePath = getFilePath();
  const url = `https://api.github.com/repos/${REPO}/contents/${filePath}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
  });

  const data = await res.json();
  const content = atob(data.content);
  const json = JSON.parse(content);

  const tbody = document.querySelector("#logTable tbody");
  tbody.innerHTML = "";
  json.forEach(item => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td><input value="${item.produk || ''}"></td>
      <td><input value="${item.batch || ''}"></td>
      <td><input value="${item.mesin || ''}"></td>
      <td><input type="date" value="${item.tglPakai || ''}"></td>
      <td><input type="date" value="${item.tglKembali || ''}"></td>
      <td><input type="checkbox" ${item.acc ? 'checked' : ''}></td>
    `;
  });
  if (json.length === 0) addRow();
}

function addRow() {
  const row = document.querySelector("#logTable tbody").insertRow();
  row.innerHTML = `
    <td><input></td>
    <td><input></td>
    <td><input></td>
    <td><input type="date"></td>
    <td><input type="date"></td>
    <td><input type="checkbox"></td>
  `;
}

async function saveData() {
  const tbody = document.querySelector("#logTable tbody");
  const rows = Array.from(tbody.rows);
  const data = rows.map(r => ({
    produk: r.cells[0].querySelector('input').value,
    batch: r.cells[1].querySelector('input').value,
    mesin: r.cells[2].querySelector('input').value,
    tglPakai: r.cells[3].querySelector('input').value,
    tglKembali: r.cells[4].querySelector('input').value,
    acc: r.cells[5].querySelector('input').checked
  }));

  const filePath = getFilePath();
  const url = `https://api.github.com/repos/${REPO}/contents/${filePath}`;

  // Get SHA untuk update
  const getRes = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
  });
  const getJson = await getRes.json();
  const sha = getJson.sha;

  const saveRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update logbook data",
      content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
      sha
    })
  });

  if (saveRes.ok) {
    document.getElementById("status").innerText = "✔️ Data berhasil disimpan ke GitHub.";
  } else {
    document.getElementById("status").innerText = "❌ Gagal menyimpan.";
  }
}
