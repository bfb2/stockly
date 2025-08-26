class OrderedSet:
    def __init__(self, *nums):
        self.ordered_set = []
        for num in nums:
            self.add(num)
            
    def __str__(self):
        return str(self.ordered_set)
    
    def add(self, num):
        if num not in self.ordered_set:
            self.ordered_set.append(num)
            
    def __iter__(self):
        return iter(self.ordered_set)
    





        