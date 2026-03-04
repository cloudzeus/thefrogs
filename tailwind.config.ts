import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				monks: {
					black: '#0a0a0a',
					dark: '#111111',
					gray: '#1a1a1a',
					light: '#888888',
					white: '#ffffff',
					accent: '#e60000',
					'red-dark': '#8a0000',
					'red-light': '#ff4d4d'
				},
				/* Admin dashboard accent colors (TWISTY-style) */
				admin: {
					'surface': '#E8EDF2',
					'card': '#FFFFFF',
					'text': '#333333',
					'text-muted': '#7F8A9B',
					'accent-teal': '#3F6386',
					'accent-blue': '#4A90E2',
					'accent-orange': '#FC6027',
					'accent-red': '#DD5447',
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: [
					'Inter',
					'system-ui',
					'sans-serif'
				],
				display: [
					'Inter',
					'system-ui',
					'sans-serif'
				]
			},
			fontSize: {
				'display-xl': [
					'clamp(2.5rem, 6vw, 6rem)',
					{
						lineHeight: '0.9',
						letterSpacing: '-0.02em'
					}
				],
				'display-lg': [
					'clamp(2rem, 5vw, 5rem)',
					{
						lineHeight: '0.95',
						letterSpacing: '-0.02em'
					}
				],
				'display-md': [
					'clamp(1.5rem, 3.5vw, 3rem)',
					{
						lineHeight: '1',
						letterSpacing: '-0.01em'
					}
				]
			},
			animation: {
				'fade-up': 'fadeUp 0.8s ease-out forwards',
				'fade-in': 'fadeIn 0.6s ease-out forwards',
				gradient: 'gradient 8s linear infinite'
			},
			keyframes: {
				fadeUp: {
					'0%': {
						opacity: '0',
						transform: 'translateY(40px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				fadeIn: {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					}
				},
				gradient: {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
