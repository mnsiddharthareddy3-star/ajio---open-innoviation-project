// AJIO Storefront API Client Helper
async function fetchProductsFromServer() {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products from SQLite API');
    return await response.json();
}
