export async function getUrlMetadata(url: string) {
    try {
        let response = await fetch(`http://10.10.10.10:5055/metadata?url=${encodeURIComponent(url)}`);
        let data = await response.json();
        if (data.error) {
            return url;
        }
        return data.title;
    } catch (error) {
        return url;
    }
}