import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

@IonicPage()
@Component({
  selector: 'page-ask_me',
  templateUrl: 'ask_me.html'
})
export class AskMePage {
  userInput: string = '';
  readonly quickLinks: string[] = [
    'Credit Card', 'Savings Account', 'Personal Loan', 'Home Loan',
    'Fixed Deposit', 'Apply Now', 'Report a Fraud', 'Block Credit Card',
    'Block Debit Card', 'Others'
  ];

  messages: ChatMessage[] = [
    {
      text: `Hi! Welcome to ICICI Bank, I am iPal - ICICI Bank Chatbot.\nGet started using our quick links or feel free to type in the below box to ask your query.`,
      isUser: false,
      timestamp: this._getFormattedTimestamp()
    }
  ];

  // 🕒 Format timestamp as "30 Apr, 4:31pm"
  private _getFormattedTimestamp(): string {
    const now = new Date();
    const day = now.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[now.getMonth()];
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${day} ${month}, ${hours}:${minutesStr}${ampm}`;
  }

  // 🚀 Send user message and simulate bot reply
  sendMessage(): void {
    if (this.userInput.trim()) {
      this.messages.push({
        text: this.userInput,
        isUser: true,
        timestamp: this._getFormattedTimestamp()
      });
      const userMsg = this.userInput;
      this.userInput = '';
      // 🤖 Simulate bot response
      setTimeout(() => {
        this.messages.push({
          text: 'This is a sample response for: ' + userMsg,
          isUser: false,
          timestamp: this._getFormattedTimestamp()
        });
      }, 500);
    }
  }

  // ⚡ Quick link handler
  sendQuickLink(link: string): void {
    this.messages.push({
      text: link,
      isUser: true,
      timestamp: this._getFormattedTimestamp()
    });
    // 🤖 Simulate bot response
    setTimeout(() => {
      this.messages.push({
        text: 'This is a sample response for: ' + link,
        isUser: false,
        timestamp: this._getFormattedTimestamp()
      });
    }, 500);
  }
}