import { createLogger, transports, format, Logger } from "winston";
import { Format } from "logform";

export default function(
  level: string = "debug",
  colourise: boolean = false,
  prefix: string = "1"
): Logger {
  let formats: Format[] = [
    format.label({ label: prefix.padStart(2, "0") }),
    format.timestamp({ format: "%Y-%m-%d %T,%L" })
  ];

  if (colourise) {
    formats.push(format.colorize());
  }

  return createLogger({
    level: level,
    format: format.combine(...formats),
    transports: [new transports.Console({ handleExceptions: true })]
    // handleExceptions: true
  });
}
