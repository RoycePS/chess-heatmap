import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://chessheat.royceps.com'

    const featuredUsers = ['EricRosen', 'hikaru']

    const userUrls = featuredUsers.map((username) => ({
        url: `${baseUrl}/user/${username}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        ...userUrls,
    ]
}
