// @ts-check
 
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['bls-eth-wasm'],
    },
    webpack: config => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding')
        return config
    }
}
export default nextConfig
 