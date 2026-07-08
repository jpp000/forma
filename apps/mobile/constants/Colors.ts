import { formaColors } from '@/src/theme/tokens';

const tintColorLight = formaColors.primary;
const tintColorDark = formaColors.primary;

export default {
  light: {
    text: formaColors.light.ink,
    background: formaColors.light.bg,
    tint: tintColorLight,
    tabIconDefault: formaColors.light.inkSecondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: formaColors.dark.ink,
    background: formaColors.dark.bg,
    tint: tintColorDark,
    tabIconDefault: formaColors.dark.inkSecondary,
    tabIconSelected: tintColorDark,
  },
};
