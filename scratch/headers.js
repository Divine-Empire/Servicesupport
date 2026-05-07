const sheet_url = "https://script.google.com/macros/s/AKfycbwu7wzvou_bj7zZvM1q5NCzTgHMaO6WMZVswb3aNG8VJ42Jz1W_sAd4El42tgmg3JKC/exec";
const Sheet_Id = "1teE4IIdCw7qnQvm_W7xAPgmGgpU13dtYw6y5ui01HHc";

async function getHeaders() {
    try {
        const response = await fetch(`${sheet_url}?sheetId=${Sheet_Id}&sheet=Service-Installation`);
        const result = await response.json();
        const headerRowIndex = result.data.findIndex(row => row[0] === "Timestamp");
        const headers = result.data[headerRowIndex];
        console.log(JSON.stringify(headers));
    } catch (e) {
        console.error(e);
    }
}

getHeaders();
