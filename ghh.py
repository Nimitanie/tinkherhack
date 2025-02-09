class TripPlanner:
    def __init__(self):
        self.trip_details = {}
    
    def collect_basic_info(self):
        print("\n=== Trip Planning System ===\n")
        self.trip_details['main_contact'] = input("Enter your name: ")
        
        # Collect group members information
        self.trip_details['members'] = []
        num_members = int(input("Enter the number of people traveling (including yourself): "))
        
        for i in range(num_members):
            member = {}
            print(f"\nMember {i+1} details:")
            member['name'] = input("Name: ")
            member['age'] = int(input("Age: "))
            self.trip_details['members'].append(member)
    
    def collect_trip_preferences(self):
        # Budget information
        self.trip_details['budget'] = float(input("\nWhat is your total budget for the trip? $"))
        
        # Destination preferences
        print("\nEnter your preferred destinations (separate multiple places with commas):")
        self.trip_details['destinations'] = [place.strip() for place in input().split(',')]
        
        # Food preferences
        print("\nFood preference:")
        print("1. Vegetarian")
        print("2. Non-vegetarian")
        print("3. Both")
        food_choice = int(input("Enter your choice (1-3): "))
        self.trip_details['food_preference'] = {1: "Vegetarian", 2: "Non-vegetarian", 3: "Both"}[food_choice]
        
        # Accommodation preferences
        print("\nAccommodation preference:")
        print("1. Hotel")
        print("2. Resort")
        print("3. Homestay")
        print("4. Camping")
        acc_choice = int(input("Enter your choice (1-4): "))
        self.trip_details['accommodation'] = {
            1: "Hotel", 2: "Resort", 3: "Homestay", 4: "Camping"
        }[acc_choice]
        
        # Trip dates and duration
        self.trip_details['start_date'] = input("\nEnter start date (DD/MM/YYYY): ")
        self.trip_details['duration'] = int(input("Enter trip duration (in days): "))
        
        # Weather preference
        print("\nPreferred weather:")
        print("1. Sunny")
        print("2. Moderate")
        print("3. Cold")
        weather_choice = int(input("Enter your choice (1-3): "))
        self.trip_details['weather_preference'] = {
            1: "Sunny", 2: "Moderate", 3: "Cold"
        }[weather_choice]
    
    def display_trip_summary(self):
        print("\n=== Trip Summary ===")
        print(f"\nMain Contact: {self.trip_details['main_contact']}")
        
        print("\nGroup Members:")
        for member in self.trip_details['members']:
            print(f"- {member['name']} (Age: {member['age']})")
        
        print(f"\nBudget: ${self.trip_details['budget']}")
        print(f"Preferred Destinations: {', '.join(self.trip_details['destinations'])}")
        print(f"Food Preference: {self.trip_details['food_preference']}")
        print(f"Accommodation: {self.trip_details['accommodation']}")
        print(f"Start Date: {self.trip_details['start_date']}")
        print(f"Duration: {self.trip_details['duration']} days")
        print(f"Weather Preference: {self.trip_details['weather_preference']}")

def main():
    planner = TripPlanner()
    try:
        planner.collect_basic_info()
        planner.collect_trip_preferences()
        planner.display_trip_summary()
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        print("Please try again with valid inputs.")

if __name__ == "__main__":
    main()