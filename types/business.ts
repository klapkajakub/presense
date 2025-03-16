export type PlatformDescriptions = {
    gmb: string
    fb: string
    ig: string
}

export interface PlatformConfig {
    name: string
    description: string
    maxLength: number
    icon: string
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
        google: {
                maxLength: 750,
                name: 'Google Business Profile',
                description: 'Business description for Google Search and Maps'
        },
        facebook: {
                maxLength: 1000,
                name: 'Facebook Page',
                description: 'About section for your Facebook business page'
        },
        firmy: {
                maxLength: 500,
                name: 'Firmy.cz',
                description: 'Business description for Firmy.cz listing'
        },
        instagram: {
                maxLength: 2200,
                name: 'Instagram Bio',
                description: 'Business profile description for Instagram'
        }
} as const;