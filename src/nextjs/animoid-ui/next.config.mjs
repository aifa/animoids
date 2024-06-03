// @ts-check
 
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['bls-eth-wasm'],
    }
}
export default nextConfig
 