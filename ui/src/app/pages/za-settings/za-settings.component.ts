import { Component, Input, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Subject } from 'rxjs';
import { ServerAuth, ServerUser } from 'src/app/entities/user';
import { SessionService } from 'src/app/services/session/session.service';

@Component({
  selector: 'za-za-settings',
  templateUrl: './za-settings.component.html',
  styleUrls: ['./za-settings.component.scss'],
})
export class ZASettingsComponent implements OnInit {
  @Input() user!: ServerAuth.AuthGetResponse['user'] | null;

  userSubj = new Subject<ServerAuth.AuthGetResponse['user'] | null>();

  constructor(
    private sessionService: SessionService,
    private config: PrimeNGConfig,
  ) {
    this.userSubj.next(this.user);

    this.config.setTranslation({
      accept: 'Готово',
      reject: 'Отмена',
      dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      clear: 'Очистить',
      monthNames: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
      ],
      dateFormat: 'dd/mm/yy',
      today: 'Выбрать сегодня',
    });
  }

  ngOnInit(): void {}
}
