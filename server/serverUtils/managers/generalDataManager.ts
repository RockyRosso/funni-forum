//-- Functions

export function formatDataPages(
    data: Array<any>,
    page: number,
    customFilter?: (value: any, index: number, array: any[]) => unknown,
) {
    const { maxPageSize } = useAppConfig();

    let dataSection = data.slice(
        maxPageSize * page - maxPageSize,
        maxPageSize * page,
    );

    if (customFilter) {
        dataSection = dataSection.filter(customFilter);
    }

    return dataSection;
}

//--
