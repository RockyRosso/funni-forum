export default function formatCategoryNames(categories: Array<any>) {
    for (let i = 0; i < categories.length; i++) {
        categories[i].classname = categories[i].name
            .split(' ')
            .join('_')
            .toLowerCase();
        const splitName = categories[i].name.split('_');

        for (let c = 0; c < splitName.length; c++) {
            splitName[c] =
                splitName[c][0].toUpperCase() + splitName[c].slice(1);
        }

        categories[i].name = splitName.join(' ');
    }

    return categories;
}
