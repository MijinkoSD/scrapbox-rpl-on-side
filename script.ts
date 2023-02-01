/// <reference no-default-lib="true" />
/// <reference lib="es2022" />
/// <reference lib="dom" />

import {
  patch,
  useStatusBar,
} from "https://raw.githubusercontent.com/takker99/scrapbox-userscript-std/0.19.0/mod.ts";
import { Line } from "https://raw.githubusercontent.com/takker99/scrapbox-userscript-std/0.19.0/deps/scrapbox-rest.ts";
import {
  buildInAlertModes,
  scrapboxAlert,
} from "https://raw.githubusercontent.com/MijinkoSD/input-dialog-userscript/v1.0.1/scrapboxAlert.ts";
import { Scrapbox } from "https://raw.githubusercontent.com/scrapbox-jp/types/0.3.6/userscript.ts";
export declare const scrapbox: Scrapbox;

scrapbox.PageMenu.addMenu({
  title: "UpdateUserCSS",
  image: "https://i.gyazo.com/95e1d28e25db16bf7c4fdeeb16452179.png",
  onClick: async () => {
    const answer = await scrapboxAlert(
      buildInAlertModes.ENTER,
      "更新後のCSSを送信してください。",
    );
    const code = answer.inputValue;
    if (code === undefined || code.trim() === "") return;
    await updateCodeBlock(code, "Mijinko", "開発中のSettings_20230126-");
  },
});

/**
 * コードブロックの中身を書き換える \
 * その際コードブロック開始行より下の文字列はすべて消失する
 */
async function updateCodeBlock(
  code: string,
  targetProject: string,
  targetPage: string,
) {
  const codeLines: string[] = code.split("\n");
  const updateHandler = (lines: Line[]): string[] => {
    const codeStartIndex = lines.findIndex((e) =>
      /^\s*code:style\.css\s*$/i.test(e.text)
    );
    if (codeStartIndex === -1) {
      const linesBeforeCodeStart: string[] = lines.map(
        (e) => e.text,
      );
      const codeLinesWithIndent: string[] = codeLines.map((e) => " " + e);
      return linesBeforeCodeStart
        .concat(["code:style.css"])
        .concat(codeLinesWithIndent);
    } else {
      const matchedIndent = lines[codeStartIndex].text.match(/^\s*/);
      const codeIndent: string = matchedIndent !== null ? matchedIndent[0] : "";
      const linesBeforeCodeStart: string[] = lines.slice(0, codeStartIndex + 1)
        .map(
          (e) => e.text,
        );
      const codeLinesWithIndent: string[] = codeLines.map((e) =>
        codeIndent + " " + e
      );
      return linesBeforeCodeStart.concat(codeLinesWithIndent);
    }
  };
  const updateStatus = useStatusBar();
  // 右下に更新中のマークを出す
  updateStatus.render({
    type: "group",
    items: [{ type: "spinner" }, {
      type: "text",
      text: "CSSを反映しています…",
    }],
  });
  await patch(targetProject, targetPage, updateHandler);
  updateStatus.render({
    type: "group",
    items: [{ type: "check-circle" }, {
      type: "text",
      text: "CSSの反映が完了しました。",
    }],
  });
  setTimeout(() => updateStatus.dispose(), 2000);
}
