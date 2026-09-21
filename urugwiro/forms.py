from django import forms
from.models import *

class TenantProfileForm(forms.ModelForm):
    class Meta:
        model = Tenant
        fields = ['name', 'email', 'phone_number', 'address', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
        }
class PropertyForm(forms.ModelForm):
    class Meta:
        model = Property
        fields = ['name', 'address', 'types', 'description', 'image', 'number_of_units', 'price']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),

            'types': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control-file'}),
            'number_of_units': forms.NumberInput(attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control'}),
        }
class UnitForm(forms.ModelForm):
    class Meta:
        model = Unit
        fields = ['unit_number', 'bedrooms', 'bathrooms','rent', 'is_available']
        widgets = {
            'unit_number': forms.NumberInput(attrs={'class': 'form-control'}),
            'bedrooms': forms.NumberInput(attrs={'class': 'form-control'}),
            'bathrooms': forms.NumberInput(attrs={'class': 'form-control'}),
            'rent': forms.NumberInput(attrs={'class': 'form-control'}),
            'is_available': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }
class LeaseForm(forms.ModelForm):
    class Meta:
        model = Lease
        fields = ['listing', 'tenant', 'contract_details','start_date', 'end_date', 'contract_accepted', 'contract_signed', 'contract_archived','rent_amount']
        widgets = {
            'listing': forms.Select(attrs={'class': 'form-control'}),
            'tenant': forms.Select(attrs={'class': 'form-control'}),
            'contract_details': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'start_date': forms.DateInput(attrs={'class': 'form-control'}),
            'end_date': forms.DateInput(attrs={'class': 'form-control'}),
            'contract_accepted': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'contract_signed': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'contract_archived': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'rent_amount': forms.NumberInput(attrs={'class': 'form-control'}),
            }
class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'password': forms.PasswordInput(attrs={'class': 'form-control'}),
            }

class LoginForm(forms.Form):

    username = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(max_length=100, widget=forms.PasswordInput(attrs={'class': 'form-control'}))
class RegisterForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'password': forms.PasswordInput(attrs={'class': 'form-control'}),
            }
class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, widget=forms.TextInput(attrs={'class': 'form-control'}))
    email = forms.EmailField(max_length=100, widget=forms.EmailInput(attrs={'class': 'form-control'}))
    phone_number = forms.CharField(max_length=15, widget=forms.TextInput(attrs={'class': 'form-control'}))
    message = forms.CharField(max_length=500, widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3}))


# Forms for tenant messaging and maintenance requests
class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['recipient', 'content']
        widgets = {
            'recipient': forms.Select(attrs={'class': 'form-select'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Write your message...'}),
        }

    def __init__(self, *args, **kwargs):
        allowed_recipients = kwargs.pop('allowed_recipients', None)
        super().__init__(*args, **kwargs)
        if allowed_recipients is not None:
            self.fields['recipient'].queryset = allowed_recipients


class MaintenanceRequestForm(forms.ModelForm):
    class Meta:
        model = MaintenanceRequest
        fields = ['listing', 'title', 'description']
        widgets = {
            'listing': forms.Select(attrs={'class': 'form-select'}),
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Brief title of the issue'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Describe the problem in detail'}),
        }


# ═══════════════════════════════════════════════════════════
#   REAL ESTATE MARKETPLACE FORMS
# ═══════════════════════════════════════════════════════════

class AgentProfileForm(forms.ModelForm):
    class Meta:
        model = Agent
        fields = ['name', 'email', 'phone_number', 'license_number', 'bio', 'specialization', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'license_number': forms.TextInput(attrs={'class': 'form-control'}),
            'bio': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'specialization': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Residential, Land, Commercial'}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }


class SellerProfileForm(forms.ModelForm):
    class Meta:
        model = Seller
        fields = ['name', 'email', 'phone_number', 'address', 'id_number', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'id_number': forms.TextInput(attrs={'class': 'form-control'}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
        }


class SalePropertyForm(forms.ModelForm):
    class Meta:
        model = SaleProperty
        fields = [
            'title', 'description', 'property_type', 'listing_type', 'price', 'negotiable',
            'address', 'city', 'district', 'sector',
            'size_sqm', 'bedrooms', 'bathrooms', 'year_built',
            'has_title_deed', 'has_parking', 'has_garden', 'is_furnished',
            'image', 'image_2', 'image_3', 'image_4', 'image_5', 'video_url',
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Modern 4-Bedroom House in Kigali'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'property_type': forms.Select(attrs={'class': 'form-select'}),
            'listing_type': forms.Select(attrs={'class': 'form-select'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Price in Frw'}),
            'negotiable': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'city': forms.TextInput(attrs={'class': 'form-control'}),
            'district': forms.TextInput(attrs={'class': 'form-control'}),
            'sector': forms.TextInput(attrs={'class': 'form-control'}),
            'size_sqm': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g. 500'}),
            'bedrooms': forms.NumberInput(attrs={'class': 'form-control'}),
            'bathrooms': forms.NumberInput(attrs={'class': 'form-control'}),
            'year_built': forms.NumberInput(attrs={'class': 'form-control'}),
            'has_title_deed': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'has_parking': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'has_garden': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'is_furnished': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'image': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'image_2': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'image_3': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'image_4': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'image_5': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'video_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://youtube.com/...'}),
        }


class OfferForm(forms.ModelForm):
    class Meta:
        model = Offer
        fields = ['amount', 'message']
        widgets = {
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Your offer in Frw'}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Optional message to seller/agent'}),
        }


class PropertyInquiryForm(forms.ModelForm):
    class Meta:
        model = PropertyInquiry
        fields = ['name', 'email', 'phone', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }


class SiteVisitForm(forms.ModelForm):
    class Meta:
        model = SiteVisit
        fields = ['scheduled_date', 'notes']
        widgets = {
            'scheduled_date': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }


class AgentReviewForm(forms.ModelForm):
    class Meta:
        model = AgentReview
        fields = ['rating', 'comment']
        widgets = {
            'rating': forms.Select(attrs={'class': 'form-select'}),
            'comment': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }







#
#
# from django.db import models
# from django.contrib.auth.models import AbstractUser
# from django.utils.timezone import now
#
# user_roles = (
#     ('Owner', 'Owner'),
#     ('Tenant', 'Tenant'),
#     ('Admin', 'Admin'),
# )
#
# property_status = (
#     ('Available', 'Available'),
#     ('Rented', 'Rented'),
# )
#
# property_type = (
#     ('Apartment', 'Apartment'),
#     ('House', 'House'),
#     ('Commercial', 'Commercial'),
# )
#
# class User(AbstractUser):
#     role = models.CharField(max_length=10, choices=user_roles, default='Tenant')
#
#     def __str__(self):
#         return self.username
#
# class Owner(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField(max_length=100)
#     phone_number = models.CharField(max_length=15)
#     address = models.CharField(max_length=200)
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='owner_profile')
#     image = models.ImageField(upload_to='owner_images', blank=True)
#
#     def __str__(self):
#         return self.name
#
# class Property(models.Model):
#     name = models.CharField(max_length=100)
#     address = models.CharField(max_length=200)
#     types = models.CharField(max_length=10, choices=property_type)
#     description = models.TextField()
#     image = models.ImageField(upload_to='property_images', blank=True)
#     number_of_units = models.IntegerField()
#     status = models.CharField(max_length=20, choices=property_status, default='Available')
#     price = models.IntegerField()
#     owner = models.ForeignKey(Owner, on_delete=models.CASCADE, related_name='properties')
#     date_added = models.DateTimeField(auto_now_add=True)
#
#     def __str__(self):
#         return f"{self.name} at {self.address}"
#
# class Unit(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='units')
#     unit_number = models.IntegerField()
#     bedrooms = models.IntegerField()
#     bathrooms = models.IntegerField()
#     rent = models.IntegerField()
#     is_available = models.BooleanField(default=True)
#
#     def __str__(self):
#         return f"Unit {self.unit_number} in {self.property.name}"
#
# class Tenant(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField(max_length=100)
#     phone_number = models.CharField(max_length=15)
#     address = models.CharField(max_length=200)
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant_profile')
#     image = models.ImageField(upload_to='tenant_images', blank=True)
#
#     def __str__(self):
#         return self.name
#
# class Lease(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='leases', null=True)
#     tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='leases')
#     contract_details = models.TextField(blank=True, null=True)
#     start_date = models.DateField()
#     end_date = models.DateField()
#     contract_accepted = models.BooleanField(default=False)
#     contract_signed = models.BooleanField(default=False)
#     contract_archived = models.BooleanField(default=False)
#     rent_amount = models.IntegerField()
#
#     class Meta:
#         verbose_name_plural = "Leases"
#
#     def get_status_display(self):
#         if self.contract_accepted and self.contract_signed:
#             return "Signed"
#         elif self.contract_accepted:
#             return "Accepted"
#         else:
#             return "Made"
#
# class CustomerMessage(models.Model):
#     name = models.CharField(max_length=100)
#     email = models.EmailField(max_length=100)
#     message = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     is_archived = models.BooleanField(default=False)
#     is_read = models.BooleanField(default=False)
#
#     def __str__(self):
#         return f"Message from {self.name} ({self.email})"
#
# class Updates(models.Model):
#     title = models.CharField(max_length=100)
#     description = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     end_date = models.DateField()
#
#     class Meta:
#         verbose_name_plural = "Updates"
#
#     def __str__(self):
#         return self.title
#
# class Email(models.Model):
#     sender_email = models.EmailField(max_length=255, verbose_name="Sender's Email")
#     recipient_email = models.EmailField(max_length=255, verbose_name="Recipient's Email")
#     subject = models.CharField(max_length=255, verbose_name="Email Subject")
#     body = models.TextField(verbose_name="Email Body")
#     timestamp = models.DateTimeField(default=now, verbose_name="Received At")
#     is_read = models.BooleanField(default=False, verbose_name="Read Status")
#
#     def __str__(self):
#         return f"Email from {self.sender_email} to {self.recipient_email}"
#
#     class Meta:
#         verbose_name_plural = "Emails"
#
# class CustRequest(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='cust_requests')
#     name = models.CharField(max_length=100)
#     email = models.EmailField(max_length=100)
#     message = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     is_archived = models.BooleanField(default=False)
#     is_read = models.BooleanField(default=False)
#
# class MaintenanceRequest(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='maint_requests')
#     tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='maint_requests')
#     title = models.CharField(max_length=100)
#     description = models.TextField()
#     request_date = models.DateTimeField(auto_now_add=True)
#     completion_date = models.DateTimeField(blank=True, null=True)
#     status = models.CharField(max_length=20, choices=[
#         ('open', 'Open'),
#         ('in_progress', 'In Progress'),
#         ('completed', 'Completed')
#     ], default='open')
#
#     def __str__(self):
#         return f"{self.tenant.user.username} - {self.request_date}"
# class Payment(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='payments')
#     tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
#     amount = models.IntegerField()
#     date_paid = models.DateTimeField(auto_now_add=True)
#     def __str__(self):
#         return f"{self.tenant.user.username} - {self.date_paid}"
# class Message(models.Model):
#     sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
#     recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
#     content = models.TextField()
#     sent_date = models.DateTimeField(auto_now_add=True)
#     is_read = models.BooleanField(default=False)
#
#     def __str__(self):
#         return f"From {self.sender.username} to {self.recipient.username} - {self.sent_date}"
# class Visit(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='visits')
#     tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='visits')
#     visit_date = models.DateTimeField(auto_now_add=True)
#     description = models.TextField()
#     def __str__(self):
#         return f"{self.tenant.user.username} - {self.visit_date}"
# class LikedProperties(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='liked_properties')
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='liked_by')
#     total_likes = models.IntegerField(default=0)
#     def __str__(self):
#         return f"{self.user.username} - {self.property.name} - {self.total_likes} "
#
#
#
#





