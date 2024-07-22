import * as React from "react";
import {
  DataGridBody,
  DataGridRow,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  FluentProvider,
  Text,
  SelectionItemId,
  OnSelectionChangeData,
  TableColumnSizingOptions,
} from "@fluentui/react-components";

type EntityRecord = ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;

export interface IGridProps {
  theme: any;
  dataset: ComponentFramework.PropertyTypes.DataSet;
  selectionMode: undefined | "single" | "multiselect";
  navigate: (
    options: ComponentFramework.NavigationApi.EntityFormOptions
  ) => void;
  setSelected: (ids: string[]) => void;
}

export const BasicDataGrid: React.FunctionComponent<IGridProps> = (props: IGridProps) => {
  const [items, setItems] = React.useState<EntityRecord[]>([]);
  const [selectedItems, setSelectedItems] = React.useState<SelectionItemId[]>([]);
  const [columns, setColumns] = React.useState<TableColumnDefinition<EntityRecord>[]>([]);
  const [columnSizingOptions, setColumnSizingOptions] = React.useState<TableColumnSizingOptions>({});

  React.useEffect(() => {
    
    setItems(
      props.dataset.sortedRecordIds.map((id: string) => {
        return props.dataset.records[id];
      })
    );

    setColumns(props.dataset.columns.map((col) => {
      return createTableColumn<EntityRecord>({
        columnId: col.name,
        compare: (a, b) => {
          if (typeof a.getValue(col.name) === "number") {
            return (
              ((a.getValue(col.name) as number) ?? 0 - (b.getValue(col.name) as number) ?? 0)
            );
          } else if (typeof a.getValue(col.name) === "boolean") {
            return Number(b.getValue(col.name)) - Number(a.getValue(col.name));
          } else if (a.getValue(col.name) instanceof Date && b.getValue(col.name) instanceof Date) {
            return (
              (a.getValue(col.name) as Date).getTime() - (b.getValue(col.name) as Date).getTime()
            );
          } else {
            return (
              (a.getFormattedValue(col.name) ?? "").localeCompare(
                b.getFormattedValue(col.name) ?? ""
              )
            );
          }
        },
        renderHeaderCell: () => {
          return <Text weight="semibold">{col.displayName}</Text>;
        },
        renderCell: (item) => {
          return <TableCellLayout>{item.getFormattedValue(col.name)}</TableCellLayout>;
        },
      });
    }));

    const tableColumnSizingOptions: TableColumnSizingOptions = {};
    props.dataset.columns.forEach(columnName => {
      tableColumnSizingOptions[columnName.name] = {
        minWidth: 100,
        idealWidth: 200,
        padding: 8,
        defaultWidth: 200,
        autoFitColumns: true,
      };
    });
    setColumnSizingOptions(tableColumnSizingOptions);
  }, [props.dataset]);

  const onSelect = (_e: any, data: OnSelectionChangeData) => {
    setSelectedItems(Array.from(data.selectedItems));
    props.setSelected((Array.from(data.selectedItems)).map((item) => item.toString()));
  };

  return (
    <FluentProvider theme={props.theme} style={{width: "100%"}}>
      <DataGrid
        items={items}
        columns={columns}
        sortable
        selectionMode= { props.selectionMode }
        getRowId={(item: EntityRecord) => item.getRecordId()}
        focusMode="composite"
        style={{ minWidth: "550px" }}
        resizableColumns={true}
        onSelectionChange={onSelect}
        selectedItems={selectedItems}
        columnSizingOptions={columnSizingOptions}
      >
        <DataGridHeader>
          <DataGridRow
            selectionCell={{
              checkboxIndicator: { "aria-label": "Select all rows" },
            }}
          >
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<EntityRecord>>
          {({ item, rowId }) => (
            <DataGridRow<EntityRecord>
              key={rowId}
              selectionCell={{
                checkboxIndicator: { "aria-label": "Select row" },
              }}
            >
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </FluentProvider>
  );
};
