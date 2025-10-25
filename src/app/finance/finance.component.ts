import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

type TxType = 'income' | 'expense';

interface Transaction {
  id: string;
  title: string;
  note?: string;
  dateISO: string;     // '2025-10-13'
  amount: number;      // dương cho income, âm cho expense
  type: TxType;
  tagColor?: string;   // 'success' | 'danger' | 'warning' ...
}

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  standalone: false,
})
export class FinanceComponent {
monthLabel = 'Tháng 10, 2025';
  segment: 'all' | TxType = 'all';

  txs: Transaction[] = [
    {
      id: 't1',
      title: 'Lương tháng 10',
      note: '',
      dateISO: '2025-10-13',
      amount: 12_000_000,
      type: 'income',
      tagColor: 'success',
    },
    {
      id: 't2',
      title: 'Tiền nhà',
      note: 'Trả tiền nhà tháng 10',
      dateISO: '2025-10-13',
      amount: -3_000_000,
      type: 'expense',
      tagColor: 'danger',
    },
    {
      id: 't3',
      title: 'Dự án freelance',
      note: 'Dự án website ABC',
      dateISO: '2025-10-12',
      amount: 3_000_000,
      type: 'income',
      tagColor: 'success',
    },
  ];

  constructor(private readonly alertCtrl: AlertController) {}

  // computed
  get incomeTotal(): number {
    return this.txs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  }
  get expenseTotal(): number {
    return Math.abs(this.txs.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  }
  get balance(): number {
    return this.incomeTotal - this.expenseTotal;
  }

  get filteredTxs(): Transaction[] {
    if (this.segment === 'all') return this.txs;
    return this.txs.filter(t => t.type === this.segment);
  }

  addTx() {
    // TODO: điều hướng tới form thêm mới
    console.log('Add transaction');
  }

  async onEdit(tx: Transaction) {
    const a = await this.alertCtrl.create({
      header: 'Sửa',
      message: tx.title,
      buttons: ['OK'],
    });
    await a.present();
  }

  async onDelete(tx: Transaction) {
    const a = await this.alertCtrl.create({
      header: 'Xóa giao dịch',
      message: `Xóa "${tx.title}"?`,
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        { text: 'Xóa', role: 'destructive', handler: () => {
          this.txs = this.txs.filter(t => t.id !== tx.id);
        }},
      ],
    });
    await a.present();
  }
}
