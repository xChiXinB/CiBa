class Row {
    constructor(content) {
        this.content = content;
    }

    write(new_content) {
        if (new_content.length !== this.content.length) {
            throw new Error('新数据的长度与原先不同！');
        }

        this.content = new_content;
    }
}

class ColumnSelector {
    constructor(parentTabular, indexOfHeader) {
        this.parent_tabular = parentTabular;
        this.index_of_num = this.parent_tabular.header.indexOf(indexOfHeader);
    }

    selectRow(dataOfRow) {
        
    }
}

class Tabular {
    constructor(header) {
        this.header = header;
        this.width = this.header.length;
        this.content = [];
    }

    clear() {
        this.content = new Array();
    }

    newRow() {
        const row = new Row(new Array(this.width).fill(undefined));
        this.content.push(row);
        return row;
    }

    columnSelector(selector) {

    }
}