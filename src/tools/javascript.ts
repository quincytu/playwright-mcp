/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { z } from 'zod';
import { defineTool, type ToolFactory } from './tool.js';

const executeJavascript: ToolFactory = captureSnapshot => defineTool({
  capability: 'core',
  schema: {
    name: 'browser_execute_javascript',
    title: 'Execute JavaScript',
    description: 'Executes arbitrary JavaScript code in the context of the current tab.',
    inputSchema: z.object({
      code: z.string().describe('The JavaScript code to execute in the current tab.'),
    }),
    type: 'destructive',
  },
  handle: async (context, params) => {
    const tab = context.currentTabOrDie();
    const code = [
      `// Execute JavaScript in the current tab`,
      `await page.evaluate(/* user code */);`,
    ];
    const action = async () => {
      let result;
      try {
        result = await tab.page.evaluate(params.code);
      } catch (e) {
        result = { error: String(e) };
      }
      return {
        content: [{ type: 'text', text: typeof result === 'undefined' ? 'undefined' : JSON.stringify(result, null, 2) } as { type: 'text'; text: string }],
      };
    };
    return {
      code,
      action,
      captureSnapshot,
      waitForNetwork: false,
    };
  },
});

export default (captureSnapshot: boolean) => [
  executeJavascript(captureSnapshot),
];
