import { PlatformDescriptions } from "@/types/business"

export interface Command {
  command: string;
  platform?: keyof PlatformDescriptions;
  text?: string;
}

export interface ParsedMessage {
  mainContent: string;
  commands: Command[];
}

export function parseMessage(content: string): ParsedMessage {
  const parts = content.split('***')
  const mainContent = parts[0]
  const commands = parts.slice(1)
    .map(cmd => {
      const match = cmd.match(/^(save-description|open-description)(?:\s+(\w+)\s+"([^"]+)")?/)
      if (!match) return null;
      return {
        command: match[1],
        platform: match[2] as keyof PlatformDescriptions,
        text: match[3]
      } as Command;
    })
    .filter((cmd): cmd is Command => cmd !== null)

  return { mainContent, commands }
}

export function parseCommandOutput(content: string) {
  const commandRegex = /\[command name="([^"]+)"\]/g;
  const outputRegex = /\[output type="([^"]+)" content="([^"]+)"\]/g;
  
  // Extract the main message (everything before first command/output)
  let messageContent = content;
  const firstCommand = content.indexOf('[command');
  const firstOutput = content.indexOf('[output');
  const firstIndex = Math.min(
    firstCommand > -1 ? firstCommand : Infinity,
    firstOutput > -1 ? firstOutput : Infinity
  );
  
  if (firstIndex !== Infinity) {
    messageContent = content.substring(0, firstIndex).trim();
  }

  // Parse commands
  const commands: { name: string }[] = [];
  let cmdMatch;
  while ((cmdMatch = commandRegex.exec(content)) !== null) {
    commands.push({ name: cmdMatch[1] });
  }

  // Parse outputs
  const outputs: { type: string, content: string }[] = [];
  let outMatch;
  while ((outMatch = outputRegex.exec(content)) !== null) {
    outputs.push({
      type: outMatch[1],
      content: outMatch[2]
    });
  }

  return { messageContent, commands, outputs };
} 