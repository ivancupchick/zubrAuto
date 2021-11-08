import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerRole } from 'src/app/entities/role';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'za-create-call-base',
  templateUrl: './create-call-base.component.html',
  styleUrls: ['./create-call-base.component.scss'],
  providers: [
    UserService
  ]
})
export class CreateCallBaseComponent implements OnInit {
  get formNotValid() {
    const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return this.selectedContactUser === 'None' || !link;
  };
  loading = false;

  link = '';
  contactCenterUsers: { value: string, key: string }[] = [];
  selectedContactUser: string = 'None';

  constructor(
    private userService: UserService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) { }

  ngOnInit(): void {
    this.loading = true;

    this.userService.getUsers()
      .subscribe(users => {
        this.contactCenterUsers = [
          { value: 'Никто', key: 'None' },
          ...users
            .filter(u => u.customRoleName === ServerRole.Custom.contactCenter
                      || u.customRoleName === ServerRole.Custom.contactCenterChief)
            .map(u => ({ value: u.email, key: `${u.id}` }))
        ];
        this.loading = false;
      }, () => { this.loading = false; })
  }

  cancel() {
    this.ref.close(false);
  }

  create() {
    console.log(this.selectedContactUser);
    console.log(this.link);
  }

}
