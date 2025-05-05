# Vite & HeroUI Template

This is a template for creating applications using Vite and HeroUI (v2).

[Try it on CodeSandbox](https://githubbox.com/frontio-ai/vite-template)

## Technologies Used

- [Vite](https://vitejs.dev/guide/)
- [HeroUI](https://heroui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org)
- [Framer Motion](https://www.framer.com/motion)
- [Sentry/GlitchTip](https://glitchtip.com/) - Error tracking and monitoring

## Error Tracking with GlitchTip

This project uses Sentry/GlitchTip for error tracking and monitoring. To set up GlitchTip:

1. Create a `.env` file in the root directory (you can copy from `.env.example`)
2. Add your GlitchTip DSN to the `.env` file:
   ```
   VITE_GLITCHTIP_DSN=your-glitchtip-dsn-here
   ```

The Sentry SDK is initialized in `src/main.tsx` and will automatically capture errors and exceptions in your application.

## How to Use

To clone the project, run the following command:

```bash
git clone https://github.com/frontio-ai/vite-template.git
```

## Static Build

This project is configured to build as a static site. For more information about the static build process, see [README.static-build.md](README.static-build.md).

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## License

Licensed under the [MIT license](https://github.com/frontio-ai/vite-template/blob/main/LICENSE).
