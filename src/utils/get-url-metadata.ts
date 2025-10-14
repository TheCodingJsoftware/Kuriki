export async function getUrlMetadata(url: string) {
    try {
        let response = await fetch(`https://cert.pinelandfarms.ca/metadata?url=${encodeURIComponent(url)}`);
        let data = await response.json();
        if (data.error) {
            return url;
        }
        return data.title;
    } catch (error) {
        return url;
    }
}