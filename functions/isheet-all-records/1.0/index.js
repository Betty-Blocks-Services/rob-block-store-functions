const allISheetRecords = async ({
  params,
  url,
  accessToken,
  columnMappingRaw,
}) => {
  const columnMapping = columnMappingRaw.map(({ key, value }) => ({
    property: key,
    columnId: value,
  }));

  const rawResponse = await fetch(
    url + '?limit=' + params.take + '&offset=' + params.skip,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const response = await rawResponse.json();

  const results = response.isheet.data.item.map((row) =>
    mapRecord(row, columnMapping, params.select)
  );

  return {
    response: { results, totalCount: Number(response.isheet.totalrecordcount) },
  };
};

const mapRecord = (row, columnMapping, selectedProperties) => {
  const record = columnMapping.reduce((record, column) => {
    const cell = row.column.find(
      (cell) => cell.attributecolumnid === column.columnId
    );
    if (cell) {
      record[column.property] =
        cell.displaydata?.value ?? cell.rawdata?.value ?? null;
    }
    return record;
  }, {});

  selectedProperties.forEach((propertyInSelect) => {
    if (!record[propertyInSelect] && record[propertyInSelect] !== null) {
      record[propertyInSelect] = null;
    }
  });

  record.id = row.itemid;

  return record;
};

export default allISheetRecords;
