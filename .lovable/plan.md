# Plan: Dark Theme and Visual Refinement

The goal is to enhance the dark theme to be more immersive, using the pure black and red palette from the MJ logo across all key surfaces.

## User Review Required

> [!IMPORTANT]
> I will apply pure black backgrounds to the main content area in dark mode (currently it's a very dark gray). Should I also add subtle red glow/shadow effects to the cards to make them pop against the black background?

## Technical Details

### Styling Improvements
- Update `src/styles.css` to set `--background` to pure black `oklch(0 0 0)` in `.dark` mode.
- Update `src/routes/_authenticated/route.tsx` to remove `bg-muted/40` from the main layout wrapper and use `bg-background` to ensure it respects the dark theme variable.
- Ensure cards in `src/routes/_authenticated.dashboard.tsx` and other pages use consistent dark styling.

### Component Refinements
- Verify `Card` components across the app to ensure they have proper contrast in dark mode.
- Update the sidebar styling to be consistent with the pure black theme.

## Steps

1. **Update CSS Variables**: Modify `src/styles.css` to refine `.dark` mode variables.
2. **Layout Adjustment**: Modify `src/routes/_authenticated/route.tsx` to use the theme's background color.
3. **Card/Content Refinement**: Check and update card backgrounds and borders in dashboard and campaigns views for better dark mode visibility.
