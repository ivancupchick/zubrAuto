import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { CarService } from 'src/app/services/car/car.service';
import { SessionService } from 'src/app/services/session/session.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'za-transform-to-car-shooting',
  templateUrl: './transform-to-car-shooting.component.html',
  styleUrls: ['./transform-to-car-shooting.component.scss'],
  providers: [
    CarService,
    UserService
  ]
})
export class TransformToCarShooting implements OnInit {
  get formNotValid() {
    // const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return false;
  };

  comment = '';

  carShootingUsers: { value: string, key: string }[] = [];
  selectedCarShootingUser: string = 'None';

  shootingDate: Date = new Date();

  loading = false;

  // statuses: { value: string, key: string }[] = [];
  // selectedStatus: 'None' | FieldNames.CarStatus = 'None';

  @Input() carId!: number;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
    private userService: UserService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.carId = this.config.data.carId;

    this.userService.getUsers(true)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe(users => {
        this.carShootingUsers = [
          { value: 'Никто', key: 'None' },
          ...users
            .filter(u => u.customRoleName === ServerRole.Custom.carShooting
                      || u.customRoleName === ServerRole.Custom.carShootingChief
                      || (this.sessionService.isRealAdminOrHigher && (u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin)) )
            .map(u => ({ value: u.email, key: `${u.id}` }))
        ];
      })
  }

  create() {
    this.loading = true;

    this.carService.transformToCarShooting(this.carId, +this.shootingDate, +this.selectedCarShootingUser, this.comment).pipe(
      finalize(() => this.loading = false),
    ).subscribe(res => {
      if (res) {
        alert('Статус изменен');
        this.ref.close(true);
      } else {
        alert('Статус не изменен');
      }
    }, e => {
      console.error(e);
      alert('Статус не изменен');
    })
  }

  cancel() {
    this.ref.close(false);
  }
}
