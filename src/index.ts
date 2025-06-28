#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { K8sClient } from './utils/k8s-client';
import { SummaryAnalyzer } from './analyzers/summary';
import { ConsoleFormatter } from './formatters/console';
import { MarkdownFormatter } from './formatters/markdown';
import { CLIOptions } from './types';

const program = new Command();

program
  .name('k8s-daily-summary')
  .description('A CLI tool to collect and summarize daily Kubernetes cluster status')
  .version('1.0.0');

program
  .option('-h, --hours <number>', 'Number of hours to look back (default: 24)', '24')
  .option('-n, --namespace <string>', 'Specific namespace to analyze')
  .option('-f, --format <format>', 'Output format: console, json, markdown', 'console')
  .option('-o, --output <file>', 'Output file path (optional)')
  .option('-k, --kubeconfig <path>', 'Path to kubeconfig file')
  .action(async (options) => {
    try {
      const cliOptions: CLIOptions = {
        hours: parseInt(options.hours || '24', 10),
        namespace: options.namespace,
        format: options.format as 'console' | 'json' | 'markdown',
        output: options.output,
        kubeconfig: options.kubeconfig
      };

      if (cliOptions.hours! <= 0) {
        console.error('Error: Hours must be a positive number');
        process.exit(1);
      }

      if (!['console', 'json', 'markdown'].includes(cliOptions.format!)) {
        console.error('Error: Format must be one of: console, json, markdown');
        process.exit(1);
      }

      console.log('Connecting to Kubernetes cluster...');
      
      const client = new K8sClient(cliOptions.kubeconfig);
      const analyzer = new SummaryAnalyzer(client);

      const connected = await analyzer.testConnection();
      if (!connected) {
        console.error('Error: Failed to connect to Kubernetes cluster');
        console.error('Please check your kubeconfig and cluster connectivity');
        process.exit(1);
      }

      console.log('Connected successfully!');
      
      const summary = await analyzer.generateSummary(cliOptions);
      const insights = analyzer.generateInsights(summary);

      let output: string;

      switch (cliOptions.format) {
        case 'json':
          output = JSON.stringify({ summary, insights }, null, 2);
          break;
        case 'markdown':
          const markdownFormatter = new MarkdownFormatter();
          output = markdownFormatter.formatSummary(summary, insights);
          break;
        case 'console':
        default:
          const formatter = new ConsoleFormatter();
          output = formatter.formatSummary(summary, insights);
          break;
      }

      if (cliOptions.output) {
        try {
          const outputDir = path.dirname(cliOptions.output);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          fs.writeFileSync(cliOptions.output, output);
          console.log(`\nReport saved to: ${cliOptions.output}`);
        } catch (error) {
          console.error(`Error writing to file: ${error}`);
          process.exit(1);
        }
      } else {
        console.log('\n' + output);
      }

    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}