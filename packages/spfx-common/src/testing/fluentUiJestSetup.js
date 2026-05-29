const reactPath = require.resolve("react", { paths: [process.cwd()] });
const fluentUiPath = require.resolve("@fluentui/react", { paths: [process.cwd()] });

const React = require(reactPath);
const { registerIcons } = require(fluentUiPath);

const iconNames = [
  "calendar",
  "calendarweek",
  "checkmark",
  "chevrondown",
  "chevrondownsmall",
  "chevronup",
  "chevronupsmall",
  "contactcard",
  "errorbadge",
  "favoritestarfill",
  "filter",
  "globe",
  "headset",
  "info",
  "mail",
  "minilink",
  "news",
  "numberedlist",
  "openfile",
  "openinnewtab",
  "page",
  "recent",
  "recyclebin",
  "search",
  "stack",
  "trash",
  "warning"
];

registerIcons({
  icons: iconNames.reduce((icons, iconName) => {
    icons[iconName] = React.createElement("span", { "aria-hidden": true });
    return icons;
  }, {})
});
