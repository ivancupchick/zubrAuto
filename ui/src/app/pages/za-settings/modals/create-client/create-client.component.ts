import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DBClient } from 'src/app/entities/client';
import { ClientService } from 'src/app/services/client/client.service';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent implements OnInit {
  loading = false;

  isEdit = false;
  id!: number;
  client!: DBClient;

  formValid = false;

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(
    private clientService: ClientService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.isEdit = this.config.data.isEdit;
    this.id = this.config.data.id;
    this.client = this.config.data.client;
  }

  create() {
    this.loading = true;

    console.log(this.dynamicForm.getValue());

    // const methodObs = this.isEdit
    //   ? this.clientService.updateClient(this.dynamicForm.getValue(), this.id)
    //   : this.clientService.createClient(this.dynamicForm.getValue())

    // methodObs.subscribe(result => {
    //   if (result) {
    //     this.ref.close(true);
    //   } else {
    //     alert(this.isEdit ? 'Клиент не обновлён' : 'Клиент не создан');
    //   }
    // })
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean) {
    this.formValid = value;
  }
}
