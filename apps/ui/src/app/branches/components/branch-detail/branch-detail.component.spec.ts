import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchDetailComponent } from './branch-detail.component';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { BranchAssignmentsService } from '../../services/branch-assignments.service';
import { PlayersService } from '../../../players/services/players.service';

describe('BranchDetailComponent', () => {
  let component: BranchDetailComponent;
  let fixture: ComponentFixture<BranchDetailComponent>;

  const branchServiceMock = {
    findAll: jest.fn().mockReturnValue(of([])),
    create: jest.fn().mockReturnValue(of({})),
    delete: jest.fn().mockReturnValue(of(undefined)),
  } as Partial<BranchAssignmentsService>;

  const playersServiceMock = {
    getPlayers: jest.fn().mockReturnValue(of({ total: 0, items: [] })),
  } as Partial<PlayersService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchDetailComponent, RouterModule.forRoot([])],
      providers: [
        {
          provide: BranchAssignmentsService,
          useValue: branchServiceMock,
        },
        {
          provide: PlayersService,
          useValue: playersServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              season: '2025',
              category: 'cuarta',
              branch: 'A',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
