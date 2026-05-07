const sheet_url = "https://script.google.com/macros/s/AKfycbwu7wzvou_bj7zZvM1q5NCzTgHMaO6WMZVswb3aNG8VJ42Jz1W_sAd4El42tgmg3JKC/exec";
const Sheet_Id = "1teE4IIdCw7qnQvm_W7xAPgmGgpU13dtYw6y5ui01HHc";

async function checkMasterHeaders() {
    try {
        const response = await fetch(`${sheet_url}?sheetId=${Sheet_Id}&sheet=Master`);
        const result = await response.json();
        console.log("Master Headers:", result.data[0]);
    } catch (e) {
        console.error(e);
    }
}

checkMasterHeaders();
