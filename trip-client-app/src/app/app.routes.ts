import { Routes } from "@angular/router";
import { LoginComponent } from "./components/login-component/login-component";
import { authGuard, notAuthGuard } from "./services/auth/auth-guard";
import { ForbiddenComponent } from "./components/forbidden-component/forbidden-component";
import { UserRole } from "./models/auth.model";
import { DriverTripsComponent } from "./components/trips/driver-trips-component/driver-trips-component";
import { TripFormComponent } from "./components/trips/trip-form-component/trip-form-component";
import { UserTripsComponent } from "./components/trips/user-trips-component/user-trips-component";
import { RegisterComponent } from "./components/register-component/register-component";
import { DriverBookingsComponent } from "./components/bookings/driver-bookings-component/driver-bookings-component";
import { UserBookingsComponent } from "./components/bookings/user-bookings-component/user-bookings-component";


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login',     component: LoginComponent, canActivate: [notAuthGuard] },
    { path: 'register',  component: RegisterComponent, canActivate: [notAuthGuard] },
    { path: 'forbidden', component: ForbiddenComponent, canActivate: [authGuard] },
    {
        path: 'driver',
        canActivate: [authGuard],
        data: { roles: [UserRole.DRIVER] },
        children: [
            { path: 'trips', component: DriverTripsComponent },
            { path: 'trips/create', component: TripFormComponent },
            { path: 'trips/:id/edit', component: TripFormComponent },
            { path: 'bookings', component: DriverBookingsComponent },
            { path: 'bookings/:tripId', component: DriverBookingsComponent }
        ]
    },
    {
        path: 'user',
        canActivate: [authGuard],
        data: { roles: [UserRole.USER] },
        children: [
            { path: 'trips', component: UserTripsComponent },
            { path: 'bookings', component: UserBookingsComponent }
        ]
    }
];
