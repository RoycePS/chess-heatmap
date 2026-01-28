import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/user/'],
            disallow: ['/api/', '/dashboard/'],  
        },
        sitemap: 'https://chessheat.royceps.com/sitemap.xml',
    }
}
