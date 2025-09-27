class DataManager {
    constructor() {
        this.table = document.getElementById('word-table');
    }

    getRowElementByWord(word) {
        const rows_of_array = Array.from(this.table.rows);
        const row = rows_of_array.find((element) => {
            return element.cells[1].textContent === word;
        });
        return row;
    }

    getRowsByOk(ok) {
        const rows_of_array = Array.from(this.table.rows);
        const rows = rows_of_array.filter((element) => 
            element._ok === ok
        );
        return rows;
    }

    getVocabListLength() {
        return this.table.rows.length - 1;
    }

    getVocabList() {
        const rows_of_array = Array.from(this.table.rows);
        const list = rows_of_array.slice(1).map((row) => 
            row.cells[1].textContent
        );
        return list;
    }
}

export {DataManager};
