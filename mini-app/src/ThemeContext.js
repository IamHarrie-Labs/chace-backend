import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { LIGHT, DARK } from "./colors";
const ThemeContext = createContext({
    theme: LIGHT,
    isDark: false,
    toggle: () => { },
});
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const theme = isDark ? DARK : LIGHT;
    return (_jsx(ThemeContext.Provider, { value: { theme, isDark, toggle: () => setIsDark(d => !d) }, children: children }));
}
export function useTheme() {
    return useContext(ThemeContext);
}
