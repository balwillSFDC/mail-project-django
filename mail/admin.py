from django.contrib import admin
from django.db import models
from .models import User, Email

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    pass

class EmailAdmin(admin.ModelAdmin):
    pass


admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)