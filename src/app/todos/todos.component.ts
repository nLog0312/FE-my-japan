import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

type Status = 'todo' | 'doing' | 'done';
type Priority = 'low' | 'medium' | 'high';

interface TodoItem {
  id: string;
  title: string;
  desc?: string;
  dueISO?: string;      // '2025-10-15'
  priority: Priority;
  status: Status;
  projectTag?: string;  // hiển thị tag trạng thái (Đang làm/Hoàn thành)
  createdAt: string;
}

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
  standalone: false,
})
export class TodosComponent {
  segment: 'all' | Status = 'all';

  list: TodoItem[] = [
    {
      id: '1',
      title: 'Hoàn thành báo cáo tháng',
      desc: 'Tổng hợp báo cáo công việc và tài chính tháng 10',
      dueISO: '2025-10-15',
      priority: 'high',
      status: 'doing',
      projectTag: 'Đang làm',
      createdAt: '2025-10-01',
    },
    {
      id: '2',
      title: 'Thanh toán hóa đơn điện nước',
      desc: '',
      dueISO: '2025-10-20',
      priority: 'medium',
      status: 'todo',
      createdAt: '2025-10-05',
    },
    {
      id: '3',
      title: 'Review code dự án XYZ',
      desc: 'Kiểm tra pull request từ team',
      dueISO: '2025-10-12',
      priority: 'medium',
      status: 'done',
      projectTag: 'Hoàn thành',
      createdAt: '2025-10-08',
    },
  ];

  constructor(private readonly alertCtrl: AlertController) {}

  // ==== computed counters ====
  get countTodo()  { return this.list.filter(t => t.status === 'todo').length; }
  get countDoing() { return this.list.filter(t => t.status === 'doing').length; }
  get countDone()  { return this.list.filter(t => t.status === 'done').length; }

  get filtered(): TodoItem[] {
    if (this.segment === 'all') return this.list;
    return this.list.filter(t => t.status === this.segment);
  }

  // ==== Toggle status by tapping the circle ====
  toggleStatus(item: TodoItem) {
    const next = this.nextStatus(item.status);
    item.status = next;

    // cập nhật tag hiển thị kèm theo
    if (next === 'doing') item.projectTag = 'Đang làm';
    else if (next === 'done') item.projectTag = 'Hoàn thành';
    else item.projectTag = undefined;
  }

  private nextStatus(s: Status): Status {
    if (s === 'todo') return 'doing';
    if (s === 'doing') return 'done';
    return 'todo';
  }

  // ==== actions ====
  addItem() {
    console.log('Add new task');
  }

  async onEdit(item: TodoItem) {
    const a = await this.alertCtrl.create({
      header: 'Sửa công việc',
      message: item.title,
      buttons: ['OK'],
    });
    await a.present();
  }

  async onDelete(item: TodoItem) {
    const a = await this.alertCtrl.create({
      header: 'Xóa công việc',
      message: `Xóa "${item.title}"?`,
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        {
          text: 'Xóa',
          role: 'destructive',
          handler: () => (this.list = this.list.filter(x => x.id !== item.id)),
        },
      ],
    });
    await a.present();
  }
}
