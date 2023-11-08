"use strict";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  StrictMode
} from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ColDef,
  ColGroupDef,
  Grid,
  GridOptions,
  RowNodeTransaction
} from "ag-grid-community";
import { getData } from "./data";
import { GanttCellRendererComponent } from "./GanttCellRendererComponent";

let newCount = 1;

function createNewRowData() {
  const newData = {
    make: "Toyota " + newCount,
    model: "Celica " + newCount,
    price: 35000 + newCount * 17,
    zombies: "Headless",
    style: "Little",
    clothes: "Airbag"
  };
  newCount++;
  return newData;
}

function printResult(res: RowNodeTransaction) {
  console.log("---------------------------------------");
  if (res.add) {
    res.add.forEach(function (rowNode) {
      console.log("Added Row Node", rowNode);
    });
  }
  if (res.remove) {
    res.remove.forEach(function (rowNode) {
      console.log("Removed Row Node", rowNode);
    });
  }
  if (res.update) {
    res.update.forEach(function (rowNode) {
      console.log("Updated Row Node", rowNode);
    });
  }
}

function rowSpan(params: RowSpanParams) {
  const rowCount = params.api.getModel().getRowCount();
  console.log("Full Span returned: " + rowCount);
  return rowCount;
}
let rowCount: number = 0;

const GridExample = () => {
  const gridRef = useRef<AgGridReact>(null);
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [rowData, setRowData] = useState<any[]>(getData());
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "make",
      rowSpan: rowSpan,
      cellRendererSelector: (params: ICellRendererParams) => {
        return params.rowIndex === 0
          ? { component: GanttCellRendererComponent }
          : undefined;
      },
      width: 300,
      initialWidth: 300
    },
    { field: "model" },
    { field: "price" }
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1
    };
  }, []);

  const getRowData = useCallback(() => {
    const rowData: any[] = [];
    gridRef.current!.api.forEachNode(function (node) {
      rowData.push(node.data);
    });
    console.log("Row Data:");
    console.table(rowData);
  }, []);

  const clearData = useCallback(() => {
    const rowData: any[] = [];
    gridRef.current!.api.forEachNode(function (node) {
      rowData.push(node.data);
    });
    const res = gridRef.current!.api.applyTransaction({
      remove: rowData
    })!;
    printResult(res);
  }, []);

  const addItems = useCallback((addIndex: number | undefined) => {
    const newItems = [
      createNewRowData(),
      createNewRowData(),
      createNewRowData()
    ];
    const res = gridRef.current!.api.applyTransaction({
      add: newItems,
      addIndex: addIndex
    })!;
    printResult(res);
  }, []);

  const updateItems = useCallback(() => {
    // update the first 2 items
    const itemsToUpdate: any[] = [];
    gridRef.current!.api.forEachNodeAfterFilterAndSort(function (
      rowNode,
      index
    ) {
      // only do first 2
      if (index >= 2) {
        return;
      }
      const data = rowNode.data;
      data.price = Math.floor(Math.random() * 20000 + 20000);
      itemsToUpdate.push(data);
    });
    const res = gridRef.current!.api.applyTransaction({
      update: itemsToUpdate
    })!;
    printResult(res);
  }, []);

  const onRemoveSelected = useCallback(() => {
    const selectedData = gridRef.current!.api.getSelectedRows();
    const res = gridRef.current!.api.applyTransaction({
      remove: selectedData
    })!;
    printResult(res);
  }, []);
  const onModelUpdated = useCallback((event: ModelUpdatedEvent) => {
    const newRowCount = event.api.getModel().getRowCount();
    if (rowCount !== newRowCount) {
      // reapply column defs to update row span when row count changes
      event.api.setColumnDefs(columnDefs);
    }
  });

  return (
    <div style={containerStyle}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "4px" }}>
          <button onClick={() => addItems(undefined)}>Add Items</button>
          <button onClick={() => addItems(2)}>Add Items addIndex=2</button>
          <button onClick={updateItems}>Update Top 2</button>
          <button onClick={onRemoveSelected}>Remove Selected</button>
          <button onClick={getRowData}>Get Row Data</button>
          <button onClick={clearData}>Clear Data</button>
        </div>
        <div style={{ flexGrow: "1" }}>
          <div style={gridStyle} className="ag-theme-alpine">
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowSelection={"multiple"}
              animateRows={true}
              onModelUpdated={onModelUpdated}
              suppressRowTransform={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <GridExample />
  </StrictMode>
);
